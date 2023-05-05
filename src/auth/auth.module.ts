import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserEntity } from './entities/user.entity';
import { FriendRequestEntity } from './entities/friend-request.entity';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '3600s' },
      }),
    }),
    TypeOrmModule.forFeature([UserEntity, FriendRequestEntity]),
  ],
  providers: [AuthService], //JwtGuard, JwtStrategy, RolesGuard, UserService
  controllers: [AuthController], //UserController
  exports: [AuthService], //UserService
})
export class AuthModule {}
