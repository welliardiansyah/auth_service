import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { DatabaseService } from './database/database.service';
import { HashModule } from './hash/hash.module';
import { InternalModule } from './internal/internal.module';
import { RolesModule } from './roles/roles.module';
import { SeederModule } from './database/seeders/seeder.module';
import { SpecialRolesModule } from './special-roles/special-roles.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseService,
    }),
    HttpModule,
    AuthModule,
    RolesModule,
    CommonModule,
    HashModule,
    SeederModule,
    SpecialRolesModule,
    InternalModule,
    SeederModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
