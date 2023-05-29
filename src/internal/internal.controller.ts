import { Body, Controller, Param, Post } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { MessageService } from 'src/message/message.service';
import { ResponseService } from 'src/response/response.service';
import { SpecialRolesService } from 'src/special-roles/special-roles.service';

@Controller('/api/v1/auth/internal')
export class InternalController {
  constructor(
    private readonly responseService: ResponseService,
    private readonly messageService: MessageService,
    private readonly specialRolesService: SpecialRolesService,
    private readonly authService: AuthService,
  ) {}

  @Post('special-roles/get-by-code/:code')
  async getSpecialRoleByCode(@Param('code') code: string) {
    const result = await this.specialRolesService.findByCode(code);
    return this.responseService.success(
      true,
      this.messageService.get('auth.general.success'),
      result,
    );
  }

  @Post('getting-application')
  async findAppsByPhones(@Body() phones: string) {
    const dataPhone = Object.values(phones).shift();
    const result = await this.authService.findAppsByPhone(dataPhone);

    return result;
  }

  @Post('special-roles/get-by-codes')
  async getSpecialRoleByCodes(@Body() codes: string[]) {
    const result = await this.specialRolesService.findByCodes(codes);
    return this.responseService.success(
      true,
      this.messageService.get('auth.general.success'),
      result,
    );
  }
}
