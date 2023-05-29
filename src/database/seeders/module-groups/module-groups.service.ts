import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesGroupsDocument } from 'src/database/entities/roles-groups.entity';
import { IModuleGroup } from 'src/database/interfaces/module-group.interface';
import { rolesGroups } from 'src/database/seeders/module-groups/module-groups.data';
import { Repository } from 'typeorm';

@Injectable()
export class ModuleGroupsSeederService {
  constructor(
    @InjectRepository(RolesGroupsDocument)
    private readonly rolesGroupsRepository: Repository<RolesGroupsDocument>,
  ) {}
  create(): Array<Promise<RolesGroupsDocument>> {
    return rolesGroups.map(async (rolesGroup: IModuleGroup) => {
      try {
        const foundRolesGroup = await this.rolesGroupsRepository.findOne({
          id: rolesGroup.id,
        });
        if (foundRolesGroup) {
          return Promise.resolve(null);
        }
        const createRolesGroup = this.rolesGroupsRepository.create(rolesGroup);
        return await this.rolesGroupsRepository.save(createRolesGroup);
      } catch (error) {
        return Promise.reject(error);
      }
    });
  }
}
