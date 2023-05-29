import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialRolesDocument } from 'src/database/entities/special-roles.entity';
import { SpecialRolesSeederService } from './special-roles.service';

/**
 * Import and provide seeder classes for special roles.
 *
 * @module
 */
@Module({
  imports: [TypeOrmModule.forFeature([SpecialRolesDocument])],
  providers: [SpecialRolesSeederService],
  exports: [SpecialRolesSeederService],
})
export class SpecialRolesSeederModule {}
