import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { enumRoleStatus, Platform } from '../enums/roles.enum';
import { RolesModulesDocument } from './roles-modules.entity';
import { SpecialRolesDocument } from './special-roles.entity';

@Entity({ name: 'auth_users_roles' })
export class RolesDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  name: string;

  @Column({
    type: 'enum',
    enum: enumRoleStatus,
    default: enumRoleStatus.inactive,
  })
  status: string;

  @Column({
    type: 'enum',
    enum: Platform,
    default: Platform.NONE,
    nullable: true,
  })
  platform: string;

  @Exclude()
  @CreateDateColumn({ type: 'timestamptz', nullable: true, default: null })
  created_at: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamptz', nullable: true, default: null })
  updated_at: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true, default: null })
  deleted_at: Date;

  @OneToMany(
    () => RolesModulesDocument,
    (module_permissions) => module_permissions.role,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  module_permissions: RolesModulesDocument[];

  @OneToOne(() => SpecialRolesDocument, (special_role) => special_role.role, {
    cascade: true,
  })
  special_role: SpecialRolesDocument;

  constructor(init?: Partial<RolesDocument>) {
    Object.assign(this, init);
  }
}
