import {
  BadRequestException,
  Body,
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
import { RolesGroupsDocument } from 'src/database/entities/roles-groups.entity';
import { ResponseService } from 'src/response/response.service';
import { RolesServices } from './roles.service';
import { RolesQueryFilter } from './validation/roles.dto';

@Controller('api/v1/auth/roles/groups')
export class RolesGroupsController {
  constructor(
    private readonly responseService: ResponseService,
    private readonly rolesService: RolesServices,
  ) {}

  @Post()
  async createGroupsModules(@Body() payload: Record<string, any>) {
    try {
      const { name, platform, sequence } = payload;
      const data = new RolesGroupsDocument({
        name,
        platform,
        sequence,
      });

      const result = await this.rolesService
        .createModuleGroupRole(data)
        .catch((e) => {
          throw e;
        });

      return this.responseService.success(
        true,
        `Success Create Group Module!`,
        result,
      );
    } catch (e) {
      Logger.error(`ERROR! ${e.message}`, 'POST Module Groups');
      throw e;
    }
  }

  @Get('/:id')
  async getDetailedGroup(@Param('id') id: string) {
    try {
      const result = await this.rolesService.findModuleGroupByIDWithRelations(
        id,
        [
          'modules',
          'modules.roles',
          'modules.roles.role',
          'modules.roles.role.special_role',
        ],
      );

      if (!result) {
        throw new NotFoundException(
          this.responseService.error(
            HttpStatus.NOT_FOUND,
            {
              constraint: ['id does NOT found'],
              value: id,
              property: 'group-id',
            },
            'Not Found Exception',
          ),
        );
      }

      return this.responseService.success(
        true,
        'Success GET Detailed Module Group by ID',
        result,
      );
    } catch (e) {
      Logger.error(`ERROR! ${e.message}`, 'GET Detailed Module Group By ID');
      throw e;
    }
  }

  @Get()
  async queryGroupsModules(@Query() query: RolesQueryFilter) {
    try {
      const result = await this.rolesService
        .queryModuleGroups(query)
        .catch((e) => {
          throw e;
        });

      return this.responseService.success(
        true,
        `Success Query Groups Module!`,
        result,
      );
    } catch (e) {
      Logger.error(`ERROR! ${e.message}`, 'GET Module Groups');
      throw e;
    }
  }

  @Delete('/:id')
  async deleteGroupsModules(@Param('id') id: string) {
    try {
      const result = await this.rolesService.deleteModuleGroupByID(id);
      if (result.affected == 0)
        throw new BadRequestException(
          'Failed to delete group, invalid group-id parameter',
          'Failed to delete Group Modules',
        );

      return this.responseService.success(
        true,
        'Success delete Groups Modules!',
        result,
      );
    } catch (e) {
      Logger.error(`ERROR! ${e.message}`, '', 'DELETE Group Module');
      throw e;
    }
  }

  @Put('/:id')
  async updateGroupsModules(
    @Param('id') id: string,
    @Body() payload: Record<string, any>,
  ) {
    try {
      const isExist = await this.rolesService.findModuleGroupByID(id);
      if (!isExist) {
        throw new NotFoundException(
          this.responseService.error(
            HttpStatus.NOT_FOUND,
            {
              constraint: ['ID not found!'],
              value: id,
              property: 'group-id',
            },
            'Not Found Exception',
          ),
        );
      }

      const newData = new RolesGroupsDocument({
        ...payload,
        name: payload.name,
        platform: payload.platform,
        sequence: payload.sequence,
      });

      const result = await this.rolesService.updateModuleGroup(id, newData);
      return this.responseService.success(
        true,
        'Success update Group Modules!',
        result,
      );
    } catch (e) {
      Logger.error(`ERROR! ${e.message}`, '', 'PUT Group Modules');
      throw e;
    }
  }
}
