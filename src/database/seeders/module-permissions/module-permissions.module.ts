import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGroupsDocument } from 'src/database/entities/roles-groups.entity';
import { RolesPermissionDocument } from 'src/database/entities/roles-permission.entity';
import { ModulePermissionsSeederService } from 'src/database/seeders/module-permissions/module-permissions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolesGroupsDocument, RolesPermissionDocument]),
  ],
  providers: [ModulePermissionsSeederService],
  exports: [ModulePermissionsSeederService],
})
export class ModulePermissionsSeederModule {}
