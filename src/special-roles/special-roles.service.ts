import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SpecialRolesDocument } from 'src/database/entities/special-roles.entity';
import { MessageService } from 'src/message/message.service';
import { RMessage } from 'src/response/response.interface';
import { ResponseService } from 'src/response/response.service';
import { RolesServices } from 'src/roles/roles.service';
import { FindConditions, ILike, In, Repository } from 'typeorm';
import { ListSpecialRolesDto } from './dto/list-special-roles.dto';
import { UpdateSpecialRoleDto } from './dto/update-special-role.dto';

@Injectable()
export class SpecialRolesService {
  constructor(
    @InjectRepository(SpecialRolesDocument)
    private readonly specialRolesRepository: Repository<SpecialRolesDocument>,
    private readonly responseService: ResponseService,
    private readonly messageService: MessageService,
    private readonly rolesService: RolesServices,
  ) {}

  logger = new Logger();

  async findAll(data: ListSpecialRolesDto): Promise<SpecialRolesDocument[]> {
    const where: FindConditions<SpecialRolesDocument> = {};
    if (data.search) where.name = ILike(`%${data.search}%`);
    const specialRoles = await this.specialRolesRepository.find({
      where,
      relations: ['role'],
    });
    return specialRoles;
  }

  async findByCodes(codes: string[]): Promise<SpecialRolesDocument[]> {
    const specialRoles = await this.specialRolesRepository.find({
      where: { code: In(codes) },
      relations: ['role'],
    });
    if (!specialRoles) {
      throw new BadRequestException(
        this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: codes.join(),
            property: 'code',
            constraint: [this.messageService.get('auth.general.dataNotFound')],
          },
          'Bad Request',
        ),
      );
    }
    return specialRoles;
  }

  async findByCode(code: string): Promise<SpecialRolesDocument> {
    const specialRole = await this.specialRolesRepository.findOne({
      where: { code },
      relations: ['role'],
    });
    if (!specialRole) {
      throw new BadRequestException(
        this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: code,
            property: 'code',
            constraint: [this.messageService.get('auth.general.dataNotFound')],
          },
          'Bad Request',
        ),
      );
    }
    return specialRole;
  }

  async update(
    specialRoleId: string,
    updateSpecialRoleDto: UpdateSpecialRoleDto,
  ): Promise<SpecialRolesDocument> {
    const specialRole = await this.getAndValidateSpecialRoleById(specialRoleId);
    specialRole.role = await this.rolesService.getAndValidateRoleById(
      updateSpecialRoleDto.role_id,
    );
    try {
      const updateSpecialRole = await this.specialRolesRepository.save(
        specialRole,
      );
      return updateSpecialRole;
    } catch (e) {
      this.logger.error(`ERROR ${e.message}`, '', 'Update Role Permissions');
      const errors: RMessage = {
        value: '',
        property: '',
        constraint: [this.messageService.get('auth.general.updateFail')],
      };
      throw new BadRequestException(
        this.responseService.error(
          HttpStatus.BAD_REQUEST,
          errors,
          'Bad Request',
        ),
      );
    }
  }

  async getAndValidateSpecialRoleById(
    specialRoleId: string,
  ): Promise<SpecialRolesDocument> {
    const specialRole = await this.specialRolesRepository.findOne({
      where: { id: specialRoleId },
      relations: ['role'],
    });
    if (!specialRole) {
      throw new BadRequestException(
        this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: specialRoleId,
            property: 'special_role_id',
            constraint: [this.messageService.get('auth.general.dataNotFound')],
          },
          'Bad Request',
        ),
      );
    }
    return specialRole;
  }

  async findByRoleId(roleId: string): Promise<SpecialRolesDocument> {
    const specialRole = await this.specialRolesRepository.findOne({
      where: { role: { id: roleId } },
      relations: ['role'],
    });
    return specialRole;
  }

  async findById(id: string): Promise<SpecialRolesDocument> {
    const specialRole = await this.specialRolesRepository.findOne({
      where: { id: id },
      relations: ['role'],
    });
    if (!specialRole) {
      throw new BadRequestException(
        this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: id,
            property: 'id',
            constraint: [this.messageService.get('auth.general.dataNotFound')],
          },
          'Bad Request',
        ),
      );
    }
    return specialRole;
  }
}
