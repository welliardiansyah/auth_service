import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGroupsDocument } from 'src/database/entities/roles-groups.entity';
import { ModuleGroupsSeederService } from 'src/database/seeders/module-groups/module-groups.service';

@Module({
  imports: [TypeOrmModule.forFeature([RolesGroupsDocument])],
  providers: [ModuleGroupsSeederService],
  exports: [ModuleGroupsSeederService],
})
export class ModuleGroupsSeederModule {}
