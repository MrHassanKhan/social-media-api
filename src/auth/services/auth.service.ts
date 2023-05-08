import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Observable, from, map, of, switchMap, tap } from 'rxjs';

import * as bcrypt from 'bcrypt';
import { User } from '../models/user.class';
import { LoginDto } from '../models/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  hashPassword(password: string): Observable<string> {
    return from(bcrypt.hash(password, 12));
  }
  doesUserExist(email: string): Observable<boolean> {
    return from(this.userRepository.findOne({ where: { email } })).pipe(
      switchMap((user: UserEntity) => of(!!user)),
    );
  }
  //   async doesUserExistAnotherWay(email: string): Promise<boolean> {
  //     const user = await this.userRepository.findOne({ where: { email } });
  //     return user ? true : false;
  //   }

  register(user: User): Observable<User> {
    const { firstName, lastName, email, password } = user;
    return this.doesUserExist(email).pipe(
      tap((isExist: boolean) => {
        if (isExist) {
          throw new HttpException(
            'A user has already been created with this email address',
            HttpStatus.BAD_REQUEST,
          );
        }
      }),
      switchMap(() => {
        return this.hashPassword(password).pipe(
          switchMap((hashedPassword: string) => {
            return from(
              this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
              }),
            ).pipe(
              map((user: User) => {
                delete user.password;
                return user;
              }),
            );
          }),
        );
      }),
    );
  }

  validateUser(email: string, password: string): Observable<User> {
    return from(
      this.userRepository.findOne({
        where: { email },
        select: ['id', 'firstName', 'lastName', 'email', 'password', 'role'],
      }),
    ).pipe(
      switchMap((user: User) => {
        if (!user) {
          throw new HttpException(
            { status: HttpStatus.FORBIDDEN, error: 'User Not Found' },
            HttpStatus.FORBIDDEN,
          );
        }
        return from(bcrypt.compare(password, user.password)).pipe(
          map((isValidPassword: boolean) => {
            if (isValidPassword) {
              delete user.password;
              return user;
            } else {
              throw new HttpException(
                {
                  status: HttpStatus.BAD_REQUEST,
                  error: 'Password Incorrect',
                },
                HttpStatus.BAD_REQUEST,
              );
            }
          }),
        );
      }),
    );
  }

  login(loginDto: LoginDto): Observable<string> {
    const { email, password } = loginDto;
    return this.validateUser(email, password).pipe(
      switchMap((user: User) => {
        if (user) {
          // create JWT - credentials
          return from(this.jwtService.signAsync({ user }));
        }
      }),
    );
  }
}
