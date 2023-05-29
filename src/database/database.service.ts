import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const synchronize = process.env.DB_SYNC
      ? process.env.DB_SYNC == 'false'
        ? false
        : true
      : true;
    const dropSchema = process.env.DB_DROP_SCHEMA
      ? process.env.DB_DROP_SCHEMA == 'true'
        ? true
        : false
      : false;
    const logging = process.env.DB_LOGGING
      ? process.env.DB_LOGGING == 'true'
        ? true
        : false
      : false;
    const autoLoadEntities = process.env.DB_AUTOLOAD_ENTITIES
      ? process.env.DB_AUTOLOAD_ENTITIES == 'false'
        ? false
        : true
      : true;
    return {
      name: 'default',
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: synchronize,
      dropSchema: dropSchema,
      logging: logging,
      autoLoadEntities: autoLoadEntities,
      entities: ['dist/**/*.entity.ts', 'dist/**/**/*.entity.ts'],
    };
  }
}
