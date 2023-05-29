import { ISpecialRoles } from '../../interfaces/special-roles.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SpecialRolesDocument } from 'src/database/entities/special-roles.entity';
import { Repository } from 'typeorm';
import { special_roles } from './special-roles.data';

/**
 * Service dealing with special role based operations.
 *
 * @class
 */
@Injectable()
export class SpecialRolesSeederService {
  constructor(
    @InjectRepository(SpecialRolesDocument)
    private readonly specialRoleRepository: Repository<SpecialRolesDocument>,
  ) {}
  create(): Array<Promise<SpecialRolesDocument>> {
    return special_roles.map(async (special_role: ISpecialRoles) => {
      return await this.specialRoleRepository
        .findOne({ id: special_role.id })
        .then(async (findOne) => {
          if (findOne) {
            return Promise.resolve(null);
          }
          const create_special_role =
            this.specialRoleRepository.create(special_role);
          return await this.specialRoleRepository.save(create_special_role);
        })
        .catch((error) => Promise.reject(error));
    });
  }
}
