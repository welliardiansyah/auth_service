import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RolesPermissionDocument } from './roles-permission.entity';
import { RolesDocument } from './roles.entity';

@Entity({ name: 'auth_modules_modules_roles' })
export class RolesModulesDocument {
  @PrimaryColumn({ type: 'uuid' })
  role_id?: string;

  @PrimaryColumn({ type: 'uuid' })
  module_id?: string;

  @Column({ type: 'varchar', array: true, default: null, nullable: true })
  active_permissions: string[];

  @Exclude()
  @CreateDateColumn({ type: 'timestamptz', nullable: true, default: null })
  created_at: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamptz', nullable: true, default: null })
  updated_at: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true, default: null })
  deleted_at: Date;

  @ManyToOne(() => RolesDocument, (roles) => roles.module_permissions)
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: RolesDocument;

  @ManyToOne(
    () => RolesPermissionDocument,
    (module_permissions) => module_permissions.roles,
  )
  @JoinColumn({ name: 'module_id', referencedColumnName: 'id' })
  module: RolesPermissionDocument;

  constructor(init?: Partial<RolesModulesDocument>) {
    Object.assign(this, init);
  }
}
