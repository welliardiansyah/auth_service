import { Injectable, Logger } from '@nestjs/common';
import { ModuleGroupsSeederService } from 'src/database/seeders/module-groups/module-groups.service';
import { ModulePermissionsSeederService } from 'src/database/seeders/module-permissions/module-permissions.service';

@Injectable()
export class SeederService {
  constructor(
    private readonly logger: Logger,
    private readonly moduleGroupsSeederService: ModuleGroupsSeederService,
    private readonly modulePermissionsSeederService: ModulePermissionsSeederService,
  ) {}

  onApplicationBootstrap() {
    this.seed();
  }

  async seed() {
    await this.moduleGroups()
      .then((completed) => {
        this.logger.debug('Successively completed seeding Module Groups...');
        Promise.resolve(completed);
      })
      .catch((error) => {
        this.logger.error('Failed seeding Module Groups...');
        Promise.reject(error);
      });
    await this.modulePermissions()
      .then((completed) => {
        this.logger.debug(
          'Successively completed seeding Module Permissions...',
        );
        Promise.resolve(completed);
      })
      .catch((error) => {
        this.logger.error('Failed seeding Module Permissions...');
        Promise.reject(error);
      });
  }

  private async moduleGroups() {
    return Promise.all(this.moduleGroupsSeederService.create())
      .then((createdModuleGroups) => {
        this.logger.debug(
          'No. of Module Groups created : ' +
            createdModuleGroups.filter(
              (nullValueOrCreatedModuleGroups) =>
                nullValueOrCreatedModuleGroups,
            ).length,
        );
        return Promise.resolve(true);
      })
      .catch((error) => Promise.reject(error));
  }

  private async modulePermissions() {
    return Promise.all(this.modulePermissionsSeederService.create())
      .then((createdModulePermissions) => {
        this.logger.debug(
          'No. of Module Permissions created : ' +
            createdModulePermissions.filter(
              (nullValueOrCreatedModulePermissions) =>
                nullValueOrCreatedModulePermissions,
            ).length,
        );
        return Promise.resolve(true);
      })
      .catch((error) => Promise.reject(error));
  }
}
