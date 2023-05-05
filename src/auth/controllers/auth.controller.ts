import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../models/user.class';
import { AuthService } from '../services/auth.service';
import { LoginDto, LoginResponseDto } from '../models/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() user: User): Observable<User> {
    return this.authService.register(user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto): Observable<LoginResponseDto> {
    return this.authService
      .login(loginDto)
      .pipe(map((jwt: string) => ({ token: jwt })));
  }
}
