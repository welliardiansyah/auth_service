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
  ValidationPipe,
} from '@nestjs/common';
import { RolesDocument } from 'src/database/entities/roles.entity';
import { ResponseStatusCode } from 'src/response/response.decorator';
import { ResponseService } from 'src/response/response.service';
import { SpecialRolesService } from 'src/special-roles/special-roles.service';
import { RolesServices } from './roles.service';
import { CreateRolesDto, RolesQueryFilter } from './validation/roles.dto';

@Controller('api/v1/auth/roles')
export class RolesController {
  constructor(
    private readonly responseService: ResponseService,
    private readonly rolesService: RolesServices,
    private readonly specialRolesService: SpecialRolesService,
  ) {}

  @Post()
  async createRole(@Body() payload: CreateRolesDto) {
    try {
      //TODO: niel sanitize and validate payload.permissions

      const isExists = await this.rolesService.findUserRoleByNameAndPlatform(
        payload.name,
        payload.platform,
      );

      if (isExists) {
        throw new BadRequestException(
          this.responseService.error(
            HttpStatus.CONFLICT,
            {
              constraint: [
                `name ${payload.name} and platform ${payload.platform} already exists!`,
              ],
              property: 'name',
              value: payload.name,
            },
            'Confict Exception',
          ),
        );
      }

      // validate & parse module permissions for cascade insert.
      const module_permissions = await this.rolesService
        .parseUserRolesPermission(payload.module_permissions)
        .catch((e) => {
          throw new BadRequestException(
            this.responseService.error(
              HttpStatus.BAD_REQUEST,
              {
                constraint: [e.message],
                value: null,
                property: null,
              },
              `Incorrect user permission payload!`,
            ),
          );
        });

      const newRole = new RolesDocument({
        ...payload,
        name: payload.name,
        platform: payload.platform,
        status: payload.status,
        module_permissions: module_permissions,
      });

      const result = await this.rolesService
        .createUserRole(newRole)
        .catch((e) => {
          Logger.error(`Error! ${e.message}`, '', 'Create New Role');
          throw e;
        });

      return this.responseService.success(
        true,
        `Success create new module permissions`,
        result,
      );
    } catch (e) {
      Logger.error(`ERROR! ${e.message}`, '');
      throw e;
    }
  }

  @Get('/:id')
  async getDetailedRoles(@Param('id') id: string) {
    try {
      const isExist = await this.rolesService.getUserRoleDetailsByID(id);
      if (!isExist) {
        throw new NotFoundException(
          this.responseService.error(
            HttpStatus.NOT_FOUND,
            {
              constraint: ['id does NOT found'],
              value: id,
              property: 'role-id',
            },
            'Not Found Exception',
          ),
        );
      }

      const formattedResult = this.rolesService.parseFormatToResponse([
        isExist,
      ]);
      if (formattedResult[0] == null) {
        throw new NotFoundException(
          this.responseService.error(
            HttpStatus.NOT_FOUND,
            {
              constraint: [
                'ERROR parseFormatToResponse in auth GET detailed by ID',
              ],
              value: isExist.id,
              property: 'role-id',
            },
            'Not Found Exception',
          ),
        );
      }

      return this.responseService.success(
        true,
        `Success Get Detail user role`,
        formattedResult[0],
      );
    } catch (e) {
      Logger.error(`ERROR! ${e.message}`, '');
      throw e;
    }
  }

  @Get()
  @ResponseStatusCode()
  async queryRoles(@Query(new ValidationPipe()) query: RolesQueryFilter) {
    try {
      const result = await this.rolesService
        .queryUserRolesCompare(query)
        // .queryUserRoles(query)
        .catch((e) => {
          throw new BadRequestException(
            this.responseService.error(
              HttpStatus.BAD_REQUEST,
              null,
              `Error Get Roles Lists: ${e.message}`,
            ),
          );
        });

      return this.responseService.success(
        true,
        `Success fetch user roles`,
        result,
      );
    } catch (e) {
      Logger.error(`ERROR! ${e.message}`, '');
      throw e;
    }
  }

  @Post('/batchs')
  async queryRolesByRolesIds(@Body() role_ids: string[]) {
    try {
      const result = await this.rolesService.getUserRolesByBulkIds(role_ids);
      return this.responseService.success(
        true,
        `Success Fetch User Roles`,
        result,
      );
    } catch (e) {
      Logger.error(`ERROR ${e.message}`, '');
      throw e;
    }
  }

  @Delete('/:id')
  async deleteRoles(@Param('id') id: string) {
    try {
      const isExist = await this.rolesService.getUserModulesByID(id);
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

      const isExistInSpecialRoles = await this.specialRolesService.findByRoleId(
        isExist.id,
      );
      if (isExistInSpecialRoles) {
        throw new BadRequestException(
          this.responseService.error(
            HttpStatus.BAD_REQUEST,
            {
              constraint: ['ID has been used in special roles'],
              value: id,
              property: 'module-id',
            },
            'Bad Request',
          ),
        );
      }

      const result = await this.rolesService
        .deleteUserRoleByEntity(isExist)
        .catch((e) => {
          Logger.error(`ERROR! ${e.message}`, '', 'DELETE User Role');
          throw e;
        });

      return this.responseService.success(
        true,
        `Success Delete User Role!`,
        result,
      );
    } catch (e) {
      Logger.error(`ERROR! ${e.message}`, '', 'DELETE User Role');
      throw e;
    }
  }

  @Put('/:id')
  async updateRole(
    @Param('id') id: string,
    @Body() payload: Record<string, any>,
  ) {
    try {
      const isExist = await this.rolesService.findUserRoleByID(id, [
        'module_permissions',
      ]);
      if (!isExist) {
        throw new NotFoundException(
          this.responseService.error(
            HttpStatus.NOT_FOUND,
            {
              constraint: ['id does NOT found'],
              value: id,
              property: 'role-id',
            },
            'Not Found Exception',
          ),
        );
      }

      // validate & parse module permissions for cascade insert.
      const module_permissions = await this.rolesService
        .parseUserRolesPermission(payload.module_permissions)
        .catch((e) => {
          throw new BadRequestException(
            this.responseService.error(
              HttpStatus.BAD_REQUEST,
              {
                constraint: [e.message],
                value: null,
                property: null,
              },
              `Incorrect user permission payload!`,
            ),
          );
        });

      if (isExist) {
        // if exists, overwrite roles by dropping all relation on 'role_modules_modules_roles' table
        await this.rolesService
          .deleteAllRolesModule(isExist.id)
          .then((isSuccess) => {
            if (isSuccess) {
              Logger.debug(
                `Success dropping previous roles for role ${isExist.name}`,
              );
            }
          });
      }

      const updateRole = new RolesDocument({
        ...isExist,
        id: isExist.id,
        name: payload.name,
        platform: payload.platform,
        status: payload.status,
        module_permissions: module_permissions,
      });

      const result = await this.rolesService
        .createUserRole(updateRole)
        .catch((e) => {
          Logger.error(`Error! ${e.message}`, '', 'Create New Role');
          throw e;
        });

      return this.responseService.success(
        true,
        `Success Update User Role!`,
        result,
      );
    } catch (e) {
      Logger.error(`ERROR! ${e.message}`, '', 'PUT User Role');
      throw e;
    }
  }
}
