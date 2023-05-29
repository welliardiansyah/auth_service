import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesGroupsDocument } from 'src/database/entities/roles-groups.entity';
import { RolesModulesDocument } from 'src/database/entities/roles-modules.entity';
import { RolesPermissionDocument } from 'src/database/entities/roles-permission.entity';
import { RolesDocument } from 'src/database/entities/roles.entity';
import { enumRoleStatus } from 'src/database/enums/roles.enum';
import { MessageService } from 'src/message/message.service';
import { IListResponse } from 'src/response/response.interface';
import { ResponseService } from 'src/response/response.service';
import { Utils } from 'src/utils/general.utils';
import { Like, Repository } from 'typeorm';
import {
  ModuleGroupResponse,
  ModuleItemResponse,
  RoleDetailResponse,
} from './types/roles.responses';
import {
  BaseModulePermissionDto,
  RolesQueryFilter,
} from './validation/roles.dto';

@Injectable()
export class RolesServices {
  constructor(
    @InjectRepository(RolesGroupsDocument)
    private readonly rolesGroupRepository: Repository<RolesGroupsDocument>,
    @InjectRepository(RolesPermissionDocument)
    private readonly rolesPermissionRepository: Repository<RolesPermissionDocument>,
    @InjectRepository(RolesDocument)
    private readonly rolesRepository: Repository<RolesDocument>,
    @InjectRepository(RolesModulesDocument)
    private readonly rolesModulesRepository: Repository<RolesModulesDocument>,
    private readonly responseService: ResponseService,
    private readonly messageService: MessageService,
  ) {}

  async createModuleGroupRole(
    data: RolesGroupsDocument,
  ): Promise<RolesGroupsDocument> {
    try {
      return await this.rolesGroupRepository.save(data);
    } catch (e) {
      Logger.error(`ERROR ${e.message}`, '', 'Create Group Modules');
      throw e;
    }
  }

  async createModulePermissions(data: RolesPermissionDocument) {
    try {
      const result = await this.rolesPermissionRepository
        .save(data)
        .catch((e) => {
          throw e;
        });

      return result;
    } catch (e) {
      throw e;
    }
  }

  async createUserRole(data: RolesDocument) {
    try {
      const result = await this.rolesRepository.save(data).catch((e) => {
        throw e;
      });

      return result;
    } catch (e) {
      throw e;
    }
  }

  async deleteModuleGroupByID(id: string) {
    return this.rolesGroupRepository.softDelete(id);
  }

  async deleteModulePermissionByEntity(permission: RolesPermissionDocument) {
    if (!permission) throw new Error('Entity data is EMPTY!');
    return this.rolesPermissionRepository.softRemove(permission);
  }

  async deleteUserRoleByEntity(role: RolesDocument) {
    if (!role) throw new Error('Entity data is EMPTY!');
    return this.rolesRepository.softRemove(role);
  }

  async deleteAllRolesModule(role_id: string): Promise<boolean> {
    return this.rolesModulesRepository
      .delete({ role_id: role_id })
      .then((e) => {
        Logger.debug(
          `Drop Roles ${role_id} | affected records: ${e.affected}`,
          'Delete Roles Modules',
        );
        return e.affected > 0 ? true : false;
      })
      .catch((e) => {
        Logger.error(
          'ERROR! Delete all Role module Failed',
          '',
          'Delete Role Module',
        );
        throw e;
      });
  }

  async findModuleGroupByID(id: string): Promise<RolesGroupsDocument> {
    try {
      return await this.rolesGroupRepository.findOne(id);
    } catch (e) {
      Logger.error(`ERROR ${e.message}`, '', 'Find Group Module By ID');
      throw e;
    }
  }

  async findModuleGroupByIDWithRelations(
    id: string,
    relations?: string[],
  ): Promise<RolesGroupsDocument> {
    try {
      return await this.rolesGroupRepository.findOne(id, {
        relations: relations,
      });
    } catch (e) {
      Logger.error(`ERROR ${e.message}`, '', 'Find Group Module By ID');
      throw e;
    }
  }

  async findModulePermissionByID(id: string): Promise<RolesPermissionDocument> {
    try {
      return await this.rolesPermissionRepository.findOne(id);
    } catch (e) {
      Logger.error(`ERROR ${e.message}`, '', 'Find Role Module By ID');
      throw e;
    }
  }

  async findModulePermissionByCodeAndPlatform(code: string, platform: string) {
    try {
      return await this.rolesPermissionRepository.findOne({
        code: code,
        platform: platform,
      });
    } catch (e) {
      Logger.error(`ERROR ${e.message}`, '', 'Find Role Module By ID');
      throw e;
    }
  }

  async findModulePermissionByIdWithRelations(
    id: string,
    relations?: string[],
  ): Promise<RolesPermissionDocument> {
    try {
      return await this.rolesPermissionRepository.findOne(id, {
        relations: relations,
      });
    } catch (e) {
      Logger.error(`ERROR ${e.message}`, '', 'Find Module Permission By ID');
      throw e;
    }
  }

  async findUserRoleByID(
    id: string,
    relations?: string[],
  ): Promise<RolesDocument> {
    try {
      return await this.rolesRepository.findOne(
        { id: id },
        { relations: relations, loadEagerRelations: true },
      );
    } catch (e) {
      Logger.error(`ERROR ${e.message}`, '', 'Find Role By ID');
      throw e;
    }
  }

  async findRoleModuleByCodeName(
    code: string,
  ): Promise<RolesPermissionDocument> {
    return this.rolesPermissionRepository
      .findOne({ code: code })
      .then((res) => {
        if (res == null)
          throw new Error(`FindRoleModuleByName - role is EMPTY!`);

        return res;
      })
      .catch((e) => {
        Logger.error(`Error find module by name: ${e}`, '', 'Find Role Module');
        throw e;
      });
  }

  async findUserRoleByName(name: string): Promise<RolesDocument> {
    try {
      return await this.rolesRepository.findOne({ name: Like(`%${name}%`) });
    } catch (e) {
      Logger.error(`ERROR ${e.message}`, '', 'Find Role By Name');
      throw e;
    }
  }

  async findUserRoleByNameAndPlatform(
    name: string,
    platform: string,
  ): Promise<RolesDocument> {
    try {
      return await this.rolesRepository.findOne({
        name: name,
        platform: platform,
      });
    } catch (e) {
      Logger.error(`ERROR ${e.message}`, '', 'Find Role By Name');
      throw e;
    }
  }

  async queryUserRoles(query: RolesQueryFilter): Promise<IListResponse> {
    try {
      const search = query.search ? query.search.toLowerCase() : '';
      const curPage = query.page || 1;
      const perPage = query.limit || 10;
      const platform = Utils.getPlatformEnum(query.platform);

      const isActiveFilter = query.status === undefined ? false : true;
      const status = isActiveFilter
        ? query.status
        : [enumRoleStatus.active, enumRoleStatus.inactive];

      let skip = (curPage - 1) * perPage;
      skip = skip < 0 ? 0 : skip; //prevent negative on skip()

      const [items, totalItems] = await this.rolesRepository
        .createQueryBuilder('role')
        .leftJoinAndSelect(
          'role.module_permissions',
          'roles_modules',
          'roles_modules.role_id = role.id',
        )
        .leftJoinAndSelect(
          `roles_modules.module`,
          'permissions',
          'roles_modules.module_id = permissions.id',
        )
        .leftJoinAndSelect(
          'permissions.groups',
          'module_groups',
          'permissions.group_id = module_groups.id',
        )
        .where(
          `
          ${
            isActiveFilter
              ? `role.status = :status`
              : 'role.status in (:...status)'
          }
          ${platform ? `AND role.platform in (:...platform)` : ''}
          ${search ? 'AND lower(role.name) LIKE :name' : ''}
          `,
          {
            status: status,
            platform: platform,
            name: `%${search}%`,
          },
        )
        .orderBy('permissions.sequence', 'ASC')
        .addOrderBy('module_groups.sequence', 'ASC')
        .skip(skip)
        .take(perPage)
        .getManyAndCount()
        .catch((e) => {
          throw e;
        });

      const formattedResult = this.parseFormatToResponse(items);

      const listItems: IListResponse = {
        current_page: curPage,
        total_item: totalItems,
        limit: perPage,
        items: formattedResult,
      };

      return listItems;
    } catch (e) {
      Logger.error(`Error! ${e.message}`, '', 'Fetch all Roles');
      throw e;
    }
  }

  async queryModuleGroups(query: RolesQueryFilter): Promise<IListResponse> {
    try {
      const search = query.search ? query.search.toLowerCase() : '';
      const curPage = query.page || 0;
      const perPage = query.limit || 10;
      const platform = Utils.getPlatformEnum(query.platform);

      let skip = (curPage - 1) * perPage;
      skip = skip < 0 ? 0 : skip; //prevent negative on skip()

      const [items, totalItems] = await this.rolesGroupRepository
        .createQueryBuilder('groups')
        .leftJoinAndSelect(
          'groups.modules',
          'permissions',
          'groups.id = permissions.group_id',
        )
        .leftJoinAndSelect('permissions.roles', 'module_roles')
        .leftJoinAndSelect('module_roles.role', 'role')
        .leftJoinAndSelect('role.special_role', 'special_role')
        /**
         * menambal kelemahan typeorm jika ada order by ketika menggunakan skip dan take
         * jika ada yang lebih baik bisa di fix
         */
        .addSelect('permissions.sequence * 1', 'permissions_sequence_sorting')
        .where(
          `
          ${platform ? `groups.platform in (:...platform)` : ''}
          ${search ? 'AND lower(groups.name) LIKE :name' : ''}
          `,
          { platform: platform, name: `%${search}%` },
        )
        .orderBy({
          'groups.sequence': 'ASC',
          permissions_sequence_sorting: 'ASC',
        })
        .skip(skip)
        .take(perPage)
        .getManyAndCount()
        .catch((e) => {
          throw e;
        });

      return {
        current_page: curPage,
        total_item: totalItems,
        limit: perPage,
        items: items,
      };
    } catch (e) {
      Logger.error(`ERROR ${e.message}`, '', 'Fetch all Groups Module');
      throw e;
    }
  }

  async queryModulePermissions(
    query: RolesQueryFilter,
  ): Promise<IListResponse> {
    try {
      const search = query.search ? query.search.toLowerCase() : '';
      const curPage = query.page || 0;
      const perPage = query.limit || 10;
      const platform = Utils.getPlatformEnum(query.platform);

      let skip = (curPage - 1) * perPage;
      skip = skip < 0 ? 0 : skip; //prevent negative on skip()

      const [items, totalItems] = await this.rolesPermissionRepository
        .createQueryBuilder('permissions')
        .leftJoinAndSelect(
          'permissions.groups',
          'module_groups',
          'module_groups.id = permissions.group_id',
        )
        .leftJoinAndSelect('permissions.roles', 'module_roles')
        .leftJoinAndSelect('module_roles.role', 'role')
        .leftJoinAndSelect('role.special_role', 'special_role')
        .where(
          `
          ${platform ? `permissions.platform in (:...platform)` : ''}
          ${search ? 'AND lower(permissions.name) LIKE :name' : ''}
          `,
          { platform: platform, name: `%${search}%` },
        )
        .skip(skip)
        .take(perPage)
        .getManyAndCount()
        .catch((e) => {
          throw e;
        });

      // Trim and cleaning attributes
      const formattedItems = items.map((row) => {
        delete row.group_id;
        return row;
      });

      return {
        current_page: curPage,
        total_item: totalItems,
        limit: perPage,
        items: formattedItems,
      };
    } catch (e) {
      Logger.error(`ERROR! ${e.message}`, '', 'Query Permission Modules');
      throw e;
    }
  }

  async updateModuleGroup(
    id: string,
    data: RolesGroupsDocument,
  ): Promise<RolesGroupsDocument> {
    try {
      const updResult = await this.rolesGroupRepository.update(id, data);
      if (updResult.affected == 0) {
        Logger.log(
          `WARN Update group role success, but doenst affect anything!`,
          'Update Group Module',
        );
      }

      return await this.rolesGroupRepository.findOne(id);
    } catch (e) {
      Logger.error(`ERROR ${e.message}`, '', 'Update Group Module');
      throw e;
    }
  }

  async updateModulePermission(
    id: string,
    data: RolesPermissionDocument,
  ): Promise<RolesPermissionDocument> {
    try {
      const updResult = await this.rolesPermissionRepository.update(id, data);
      if (updResult.affected == 0) {
        Logger.log(
          `WARN Update Role Permissions success, but does NOT affect anything!`,
          'Update Module Permissions',
        );
      }
      return await this.findModulePermissionByIdWithRelations(id, ['groups']);
    } catch (e) {
      Logger.error(`ERROR ${e.message}`, '', 'Update Module Permission');
      throw e;
    }
  }

  async updateUserRole(
    id: string,
    data: RolesDocument,
  ): Promise<RolesDocument> {
    try {
      const updResult = await this.rolesRepository.update(id, data);

      if (updResult.affected > 0) {
        Logger.log(
          `WARN Update Userrole success, but does NOT affect anything!`,
          'Update User Role',
        );
      }

      return await this.rolesRepository.findOne(id);
    } catch (e) {
      Logger.error(`ERROR ${e.message}`, '', 'Update Role Permissions');
      throw e;
    }
  }

  async getAllModulePermissions(): Promise<RolesPermissionDocument[]> {
    return this.rolesPermissionRepository.find({});
  }

  async getModulePermissionByID(id: string): Promise<RolesPermissionDocument> {
    return this.rolesPermissionRepository.findOne(id);
  }

  async getUserRoleDetailsByID(id: string): Promise<RolesDocument> {
    try {
      return await this.rolesRepository
        .createQueryBuilder('role')
        .leftJoinAndSelect('role.special_role', 'special_role')
        .leftJoinAndSelect(
          'role.module_permissions',
          'roles_modules',
          'roles_modules.role_id = role.id',
        )
        .leftJoinAndSelect(
          `roles_modules.module`,
          'permissions',
          'roles_modules.module_id = permissions.id',
        )
        .leftJoinAndSelect(
          'permissions.groups',
          'module_groups',
          'permissions.group_id = module_groups.id',
        )
        .where('role.id = :id', { id })
        .orderBy('module_groups.sequence', 'ASC')
        .addOrderBy('permissions.sequence', 'ASC')
        .getOne();
    } catch (e) {
      Logger.error(`Error! ${e.message}`, '', 'Get User Role Detail');
      throw e;
    }
  }

  async getUserModulesByID(id: string): Promise<RolesDocument> {
    try {
      return await this.rolesRepository.findOne(id, {
        relations: ['module_permissions'],
      });
    } catch (e) {
      Logger.error(`Error! ${e.message}`, '', 'Get User Role Detail');
      throw e;
    }
  }

  async getUserRolesByBulkIds(roles_ids: string[]): Promise<RolesDocument[]> {
    try {
      return await this.rolesRepository.findByIds(roles_ids);
    } catch (e) {
      Logger.error(`ERROR ${e.message}`, '', 'Get User Roles By Batch');
      throw e;
    }
  }

  async parseUserRolesPermission(
    user_permissions: BaseModulePermissionDto[],
  ): Promise<RolesModulesDocument[]> {
    try {
      // populate all registered module & module's permissions
      const allPermissions = await this.getAllModulePermissions();

      return Promise.all(
        user_permissions.map(async (item) => {
          const moduleIsExists = allPermissions.filter(
            (db) => db.id === item.module_id,
          );
          const { code, id, permissions } = moduleIsExists[0];

          if (moduleIsExists.length == 0) {
            throw new Error(
              `Module Permission '${item.module_id}' is NOT registered in permissions records!`,
            );
          }

          const outerItemsIntersection = item.permissions.filter(
            // check for OUTER intersection of array permission (input) >< (registered).
            (input) => !permissions.includes(input),
          );
          if (outerItemsIntersection.length > 0) {
            Logger.error(`Unexpected permissions Input`);
            throw new Error(
              `Access permissions [${outerItemsIntersection}] is NOT registered in permissions ${code} record!`,
            );
          }

          return new RolesModulesDocument({
            module_id: id,
            active_permissions: item.permissions,
          });
        }),
      );
    } catch (e) {
      Logger.error(`Error: ${e}`, '', 'Create User Role');
      throw e;
    }
  }

  async getAndValidateRoleById(roleId: string): Promise<RolesDocument> {
    const role = await this.findUserRoleByID(roleId);
    if (!role) {
      throw new BadRequestException(
        this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: roleId,
            property: 'role_id',
            constraint: [
              this.messageService.get('catalog.general.id_notfound'),
            ],
          },
          'Bad Request',
        ),
      );
    }
    return role;
  }

  /**
   *
   * @param roles query result from rolerepository
   * @returns formatted Custom Response for FE consume
   */
  parseFormatToResponse(roles: RolesDocument[]): RoleDetailResponse[] {
    try {
      return roles.map((row) => {
        // sorting and grouping by group name, ex: 'Kelola', 'User', .etc
        const groupByGroupName = row.module_permissions.reduce((prev, cur) => {
          const group_name = cur.module['groups'].name;

          prev[group_name] = prev[group_name] || [];
          prev[group_name].push(cur);

          return prev;
        }, new RolesModulesDocument());

        // Destructure & format sesuai RoleDetailResponse untuk consume FE,
        const formattedResult = Object.keys(groupByGroupName).map((key) => {
          // Properti kombinasi dari RolesPermissions & RolesModules (active_permissions)
          const modules = groupByGroupName[key].map(
            (item: RolesModulesDocument) => {
              const { active_permissions, module } = item;
              return new ModuleItemResponse({
                id: module.id,
                group_id: module.group_id,
                sequence: module.sequence,
                platform: module.platform,
                code: module.code,
                name: module.name,
                permissions: module.permissions,
                active_permissions: active_permissions,
              });
            },
          );

          //niel - hardcode get properti group, asumsi semua 'platform' seragam.
          const { groups } = groupByGroupName[key][0].module;

          return new ModuleGroupResponse({
            id: groups.id,
            sequence: groups.sequence,
            platform: groups.platform,
            name: groups.name,
            modules: modules,
          });
        });

        const roleDetail = new RoleDetailResponse({
          id: row.id,
          name: row.name,
          platform: row.platform,
          status: row.status,
          module_permissions: formattedResult,
        });
        if (row.special_role) {
          delete row.special_role.created_at;
          delete row.special_role.updated_at;
          delete row.special_role.deleted_at;
          roleDetail.special_role = row.special_role;
        }
        return roleDetail;
      });
    } catch (e) {
      Logger.error(`Error: ${e}`, '', 'Create User Role');
      throw e;
    }
  }

  async queryUserRolesCompare(query: RolesQueryFilter): Promise<IListResponse> {
    try {
      const search = query.search ? query.search.toLowerCase() : '';
      const curPage = query.page || 1;
      const perPage = query.limit || 10;
      const platform = Utils.getPlatformEnum(query.platform);

      const isActiveFilter = query.status === undefined ? false : true;
      const status = isActiveFilter
        ? query.status
        : [enumRoleStatus.active, enumRoleStatus.inactive];

      let skip = (curPage - 1) * perPage;
      skip = skip < 0 ? 0 : skip; //prevent negative on skip()

      const resultOne = await this.rolesRepository
        .createQueryBuilder('role')
        .where(
          `
        ${
          isActiveFilter
            ? `role.status = :status`
            : 'role.status in (:...status)'
        }
        ${platform ? `AND role.platform in (:...platform)` : ''}
        ${search ? 'AND lower(role.name) LIKE :name' : ''}
        `,
          {
            status: status,
            platform: platform,
            name: `%${search}%`,
          },
        )
        .orderBy('role.name')
        .skip(skip)
        .take(perPage)
        .getManyAndCount()
        .catch((e) => {
          throw e;
        });
      const totalItems = resultOne[1];
      let formattedResult = [];

      if (resultOne[0].length > 0) {
        const listRole = [];
        for (const role of resultOne[0]) {
          listRole.push(role.id);
        }

        const resultTwo = await this.rolesRepository
          .createQueryBuilder('role')
          .leftJoinAndSelect('role.special_role', 'special_role')
          .leftJoinAndSelect(
            'role.module_permissions',
            'roles_modules',
            'roles_modules.role_id = role.id',
          )
          .leftJoinAndSelect(
            `roles_modules.module`,
            'permissions',
            'roles_modules.module_id = permissions.id',
          )
          .leftJoinAndSelect(
            'permissions.groups',
            'module_groups',
            'permissions.group_id = module_groups.id',
          )
          .where('role.id in (:...rid)', { rid: listRole })
          .orderBy('permissions.sequence', 'ASC')
          .addOrderBy('module_groups.sequence', 'ASC')
          .getMany()
          .catch((e) => {
            throw e;
          });

        formattedResult = this.parseFormatToResponse(resultTwo);
      }

      const listItems: IListResponse = {
        current_page: curPage,
        total_item: totalItems,
        limit: perPage,
        items: formattedResult,
      };

      return listItems;
    } catch (e) {
      Logger.error(`Error! ${e.message}`, '', 'Fetch all Roles');
      throw e;
    }
  }
}
