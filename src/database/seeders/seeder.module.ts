import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleGroupsSeederModule } from 'src/database/seeders/module-groups/module-groups.module';
import { SeederService } from 'src/database/seeders/seeder.service';
import { SpecialRolesModule } from 'src/special-roles/special-roles.module';
import { SpecialRolesDocument } from '../entities/special-roles.entity';
import { ModulePermissionsSeederModule } from './module-permissions/module-permissions.module';
import { Seeder } from './seeder';
import { SpecialRolesSeederService } from './special-roles/special-roles.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([SpecialRolesDocument]),
    SpecialRolesModule,
    ModuleGroupsSeederModule,
    ModulePermissionsSeederModule,
  ],
  providers: [Logger, SeederService, Seeder, SpecialRolesSeederService],
})
export class SeederModule {}
