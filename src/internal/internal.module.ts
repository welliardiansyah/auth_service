import { Module } from '@nestjs/common';
import { InternalService } from './internal.service';
import { InternalController } from './internal.controller';
import { ResponseService } from 'src/response/response.service';
import { MessageService } from 'src/message/message.service';
import { SpecialRolesService } from 'src/special-roles/special-roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialRolesDocument } from 'src/database/entities/special-roles.entity';
import { RolesServices } from 'src/roles/roles.service';
import { RolesGroupsDocument } from 'src/database/entities/roles-groups.entity';
import { RolesPermissionDocument } from 'src/database/entities/roles-permission.entity';
import { RolesDocument } from 'src/database/entities/roles.entity';
import { RolesModulesDocument } from 'src/database/entities/roles-modules.entity';
import { AuthService } from 'src/auth/auth.service';
import { OtpDocument } from 'src/database/entities/otp.entity';
import { CommonService } from 'src/common/common.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpecialRolesDocument,
      RolesGroupsDocument,
      RolesPermissionDocument,
      RolesDocument,
      RolesModulesDocument,
      OtpDocument,
    ]),
  ],
  controllers: [InternalController],
  providers: [
    InternalService,
    ResponseService,
    MessageService,
    SpecialRolesService,
    RolesServices,
    AuthService,
    CommonService,
  ],
})
export class InternalModule {}
