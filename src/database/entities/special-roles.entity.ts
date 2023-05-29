import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RolesModulesDocument } from './roles-modules.entity';
import { RolesDocument } from './roles.entity';

export enum SpecialRolesPlatforms {
  NONE = 'NONE',
  SUPERADMIN = 'SUPERADMIN',
  STORES = 'STORES',
  CUSTOMER = 'CUSTOMER',
}

@Entity({ name: 'auth_special_roles' })
export class SpecialRolesDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  code: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({
    type: 'enum',
    enum: SpecialRolesPlatforms,
    default: SpecialRolesPlatforms.NONE,
    nullable: true,
  })
  platform: string;

  @OneToMany(
    () => RolesModulesDocument,
    (module_permissions) => module_permissions.role,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  module_permissions: RolesModulesDocument[];

  @OneToOne(() => RolesDocument, (roles) => roles.special_role)
  @JoinColumn({ name: 'role_id' })
  role: RolesDocument;

  @Column({ nullable: true })
  role_id: string;

  @Exclude()
  @CreateDateColumn({ type: 'timestamptz', nullable: true, default: null })
  created_at: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamptz', nullable: true, default: null })
  updated_at: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true, default: null })
  deleted_at: Date;
}
