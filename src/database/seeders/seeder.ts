import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { SpecialRolesSeederService } from './special-roles/special-roles.service';

@Injectable()
export class Seeder implements OnApplicationBootstrap {
  constructor(
    private readonly logger: Logger,
    private readonly specialRoleSeederService: SpecialRolesSeederService,
  ) {}
  onApplicationBootstrap() {
    this.seed();
  }
  async seed() {
    await this.specialRoles()
      .then((completed) => {
        this.logger.debug('Successfuly completed seeding Special roles...');
        Promise.resolve(completed);
      })
      .catch((error) => {
        this.logger.error('Failed seeding Special roles...');
        Promise.reject(error);
      });
  }
  async specialRoles() {
    return Promise.all(this.specialRoleSeederService.create())
      .then((createdSpecialRoles) => {
        this.logger.debug(
          'No. of Special Roles created : ' +
            createdSpecialRoles.filter(
              (nullValueOrCreatedSpecialRoles) =>
                nullValueOrCreatedSpecialRoles,
            ).length,
        );
        return Promise.resolve(true);
      })
      .catch((error) => Promise.reject(error));
  }
}
