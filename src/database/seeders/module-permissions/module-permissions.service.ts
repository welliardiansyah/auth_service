import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesGroupsDocument } from 'src/database/entities/roles-groups.entity';
import { RolesPermissionDocument } from 'src/database/entities/roles-permission.entity';
import { IModulePermission } from 'src/database/interfaces/module-permission.interface';
import { rolesPermissions } from 'src/database/seeders/module-permissions/module-permissions.data';
import { Repository } from 'typeorm';

@Injectable()
export class ModulePermissionsSeederService {
  constructor(
    @InjectRepository(RolesGroupsDocument)
    private readonly rolesGroupsRepository: Repository<RolesGroupsDocument>,
    @InjectRepository(RolesPermissionDocument)
    private readonly rolesPermissionsRepository: Repository<RolesPermissionDocument>,
  ) {}
  create(): Array<Promise<RolesPermissionDocument>> {
    return rolesPermissions.map(async (rolesPermission: IModulePermission) => {
      try {
        const foundRolesPermission =
          await this.rolesPermissionsRepository.findOne({
            id: rolesPermission.id,
          });
        if (foundRolesPermission) {
          return Promise.resolve(null);
        }
        const foundRolesGroup = await this.rolesGroupsRepository.findOne({
          where: { id: rolesPermission.group_id },
        });
        const createRolesPermission = this.rolesPermissionsRepository.create({
          id: rolesPermission.id,
          code: rolesPermission.code,
          name: rolesPermission.name,
          groups: foundRolesGroup,
          permissions: rolesPermission.permissions,
          platform: rolesPermission.platform,
          sequence: rolesPermission.sequence,
        });
        return await this.rolesPermissionsRepository.save(
          createRolesPermission,
        );
      } catch (error) {
        return Promise.reject(error);
      }
    });
  }
}
