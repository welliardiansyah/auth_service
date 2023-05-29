import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpDocument } from 'src/database/entities/otp.entity';
import { CommonService } from 'src/common/common.service';
import { HttpModule } from '@nestjs/axios';
import { MessageService } from 'src/message/message.service';
import { ResponseService } from 'src/response/response.service';
import { HashService } from 'src/hash/hash.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './guard/jwt/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([OtpDocument]),
    HttpModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: () => {
        return {
          secret: process.env.AUTH_JWTSECRETKEY,
          signOptions: {
            expiresIn: process.env.AUTH_JWTEXPIRATIONTIME,
          },
        };
      },
    }),
  ],
  exports: [AuthService],
  controllers: [AuthController],
  providers: [
    AuthService,
    MessageService,
    ResponseService,
    HashService,
    CommonService,
    JwtStrategy,
  ],
})
export class AuthModule {}
