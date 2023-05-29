import { Module } from '@nestjs/common';
import { SpecialRolesService } from './special-roles.service';
import { SpecialRolesController } from './special-roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialRolesDocument } from 'src/database/entities/special-roles.entity';
import { RolesServices } from 'src/roles/roles.service';
import { ResponseService } from 'src/response/response.service';
import { MessageService } from 'src/message/message.service';
import { RolesGroupsDocument } from 'src/database/entities/roles-groups.entity';
import { RolesPermissionDocument } from 'src/database/entities/roles-permission.entity';
import { RolesDocument } from 'src/database/entities/roles.entity';
import { RolesModulesDocument } from 'src/database/entities/roles-modules.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpecialRolesDocument,
      RolesGroupsDocument,
      RolesPermissionDocument,
      RolesDocument,
      RolesModulesDocument,
    ]),
  ],
  controllers: [SpecialRolesController],
  providers: [
    ResponseService,
    MessageService,
    SpecialRolesService,
    RolesServices,
  ],
  exports: [SpecialRolesService],
})
export class SpecialRolesModule {}
