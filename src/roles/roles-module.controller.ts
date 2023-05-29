import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RolesPermissionDocument } from 'src/database/entities/roles-permission.entity';
import { ResponseService } from 'src/response/response.service';
import { RolesServices } from './roles.service';
import {
  CreateModulePermissionDto,
  RolesQueryFilter,
} from './validation/roles.dto';

@Controller('api/v1/auth/roles/modules')
export class RolesModulesController {
  constructor(
    private readonly responseService: ResponseService,
    private readonly rolesService: RolesServices,
  ) {}

  @Post()
  async createModulePermission(@Body() payload: CreateModulePermissionDto) {
    try {
      const isExist =
        await this.rolesService.findModulePermissionByCodeAndPlatform(
          payload.code,
          payload.platform,
        );
      if (isExist) {
        throw new ConflictException(
          this.responseService.error(
            HttpStatus.NOT_FOUND,
            {
              constraint: [
                `module permission with code: ${isExist.code} with platform: ${isExist.platform} are already exists!`,
              ],
              value: isExist.code,
              property: 'payload.code',
            },
            'Conflict Exception',
          ),
        );
      }

      const isGroupExist = await this.rolesService.findModuleGroupByID(
        payload.group_id,
      );
      if (!isGroupExist) {
        throw new NotFoundException(
          this.responseService.error(
            HttpStatus.NOT_FOUND,
            {
              constraint: ['ID not found!'],
              value: payload.group_id,
              property: 'group_id',
            },
            'Not Found Exception',
          ),
        );
      }

      const newPermission = new RolesPermissionDocument({
        ...payload,
      });

      const result = await this.rolesService.createModulePermissions(
        newPermission,
      );

      return this.responseService.success(
        true,
        `Success create Module Permission`,
        result,
      );
    } catch (e) {
      Logger.error(`ERROR! ${e.message}`, '');
      throw e;
    }
  }

  @Get()
  async queryModulePermissions(@Query() query: RolesQueryFilter) {
    try {
      const result = await this.rolesService.queryModulePermissions(query);

      return this.responseService.success(
        true,
        `Success fetch all modules permissions`,
        result,
      );
    } catch (e) {
      Logger.error(`ERROR! ${e.message}`, 'GET Module Permissions');
      throw e;
    }
  }

  @Get('/:id')
  async getDetailedModule(@Param('id') id: string) {
    try {
      const result =
        await this.rolesService.findModulePermissionByIdWithRelations(id, [
          'groups',
          'roles',
          'roles.role',
          'roles.role.special_role',
        ]);
      if (!result) {
        throw new NotFoundException(
          this.responseService.error(
            HttpStatus.NOT_FOUND,
            {
              constraint: ['id does NOT found'],
              value: id,
              property: 'module-id',
            },
            'Not Found Exception',
          ),
        );
      }

      return this.responseService.success(
        true,
        `Success Get Detail user role`,
        result,
      );
    } catch (e) {
      Logger.error(
        `ERROR! ${e.message}`,
        'GET Detailed Module Permission By ID',
      );
      throw e;
    }
  }

  @Delete('/:id')
  async deleteModulePermissions(@Param('id') id: string) {
    try {
      const isExist =
        await this.rolesService.findModulePermissionByIdWithRelations(id, [
          'roles',
        ]);
      if (!isExist) {
        throw new NotFoundException(
          this.responseService.error(
            HttpStatus.NOT_FOUND,
            {
              constraint: ['ID does NOT found'],
              value: id,
              property: 'module-id',
            },
            'ID Not Found',
          ),
        );
      }

      const result = await this.rolesService
        .deleteModulePermissionByEntity(isExist)
        .catch((e) => {
          Logger.error(`ERROR! ${e.message}`, '', 'DELETE Module Permissions');
          throw e;
        });

      if (!result) {
        throw new BadRequestException(
          'Failed to delete group, invalid group-id parameter',
          'Failed to delete Group Modules',
        );
      }

      return this.responseService.success(
        true,
        'Success Deleted Module Permissions!',
        result,
      );
    } catch (e) {
      Logger.error(`ERROR! ${e.message}`, '', 'DELETE Module Permissions');
      throw e;
    }
  }

  @Put('/:id')
  async updateModulePermissions(
    @Param('id') id: string,
    @Body() payload: Record<string, any>,
  ) {
    try {
      const isExist =
        await this.rolesService.findModulePermissionByIdWithRelations(id, [
          'groups',
        ]);
      if (!isExist) {
        throw new NotFoundException(
          this.responseService.error(
            HttpStatus.NOT_FOUND,
            {
              constraint: ['ID not found!'],
              value: id,
              property: 'module-id',
            },
            'Not Found Exception',
          ),
        );
      }

      const isGroupExist = await this.rolesService.findModuleGroupByID(
        payload.group_id,
      );
      if (!isGroupExist) {
        throw new NotFoundException(
          this.responseService.error(
            HttpStatus.NOT_FOUND,
            {
              constraint: ['ID not found!'],
              value: payload.group_id,
              property: 'group_id',
            },
            'Not Found Exception',
          ),
        );
      }

      const newData = new RolesPermissionDocument({
        code: payload?.code,
        group_id: payload?.group_id,
        name: payload?.name,
        permissions: payload?.permissions,
        sequence: payload?.sequence,
      });

      const result = await this.rolesService.updateModulePermission(
        id,
        newData,
      );

      return this.responseService.success(
        true,
        'Success update Module Permissions!',
        result,
      );
    } catch (e) {
      Logger.error(`ERROR! ${e.message}`, '', 'PUT Module Permissions');
      throw e;
    }
  }
}
