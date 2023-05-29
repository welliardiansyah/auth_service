import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGroupsDocument } from 'src/database/entities/roles-groups.entity';
import { RolesModulesDocument } from 'src/database/entities/roles-modules.entity';
import { RolesPermissionDocument } from 'src/database/entities/roles-permission.entity';
import { RolesDocument } from 'src/database/entities/roles.entity';
import { SpecialRolesDocument } from 'src/database/entities/special-roles.entity';
import { MessageService } from 'src/message/message.service';
import { ResponseService } from 'src/response/response.service';
import { SpecialRolesModule } from 'src/special-roles/special-roles.module';
import { RolesGroupsController } from './roles-groups.controller';
import { RolesModulesController } from './roles-module.controller';
import { RolesController } from './roles.controller';
import { RolesServices } from './roles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RolesDocument,
      RolesModulesDocument,
      RolesPermissionDocument,
      RolesGroupsDocument,
      SpecialRolesDocument,
    ]),
    SpecialRolesModule,
  ],
  controllers: [RolesModulesController, RolesGroupsController, RolesController],
  providers: [RolesServices, MessageService, ResponseService],
  exports: [RolesServices],
})
export class RolesModule {}
