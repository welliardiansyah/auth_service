import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { AuthJwtGuard } from 'src/auth/auth.decorator';
import { UserType } from 'src/hash/guard/user-type.decorator';
import { MessageService } from 'src/message/message.service';
import { ResponseService } from 'src/response/response.service';
import { ListSpecialRolesDto } from './dto/list-special-roles.dto';
import { UpdateSpecialRoleDto } from './dto/update-special-role.dto';
import { SpecialRolesService } from './special-roles.service';

@Controller('/api/v1/auth/special-roles')
export class SpecialRolesController {
  constructor(
    private readonly responseService: ResponseService,
    private readonly messageService: MessageService,
    private readonly specialRolesService: SpecialRolesService,
  ) {}

  @Get()
  @UserType('admin')
  @AuthJwtGuard()
  async findAll(@Query() data: ListSpecialRolesDto) {
    const list_result = await this.specialRolesService.findAll(data);
    return this.responseService.success(
      true,
      this.messageService.get('auth.general.success'),
      list_result,
    );
  }

  @Put(':special_role_id')
  @UserType('admin')
  @AuthJwtGuard()
  async update(
    @Param('special_role_id') specialRoleId: string,
    @Body() updateSpecialRoleDto: UpdateSpecialRoleDto,
  ) {
    const result = await this.specialRolesService.update(
      specialRoleId,
      updateSpecialRoleDto,
    );
    return this.responseService.success(
      true,
      this.messageService.get('auth.general.updateSuccess'),
      result,
    );
  }

  @Get(':special_role_id')
  @UserType('admin')
  @AuthJwtGuard()
  async getDetail(@Param('special_role_id') specialRoleId: string) {
    const result = await this.specialRolesService.findById(specialRoleId);
    return this.responseService.success(
      true,
      this.messageService.get('auth.general.success'),
      result,
    );
  }
}
