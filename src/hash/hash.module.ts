import { Global, Module } from '@nestjs/common';
import { HashService } from 'src/hash/hash.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './guard/jwt/jwt.strategy';
import { AuthModule } from 'src/auth/auth.module';

@Global()
@Module({
  providers: [
    {
      provide: 'HashService',
      useClass: HashService,
    },
    JwtStrategy,
    ConfigService,
    HashService,
  ],
  exports: [HashService],
  imports: [
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
    AuthModule,
  ],
})
export class HashModule {}
