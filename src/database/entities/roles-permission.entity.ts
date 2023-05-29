import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Platform } from '../enums/roles.enum';
import { RolesGroupsDocument } from './roles-groups.entity';
import { RolesModulesDocument } from './roles-modules.entity';

@Entity({ name: 'auth_module_permissions' })
export class RolesPermissionDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  code: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  name: string;

  @Column({ type: 'uuid', nullable: true, default: null })
  group_id: string;

  @Column({ type: 'varchar', array: true, nullable: true, default: null })
  permissions: string[];

  @Column({ type: 'enum', enum: Platform, default: Platform.NONE })
  platform: string;

  @Column({ type: 'int', default: null })
  sequence: number;

  @Exclude()
  @CreateDateColumn({ type: 'timestamptz', nullable: true, default: null })
  created_at: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamptz', nullable: true, default: null })
  updated_at: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true, default: null })
  deleted_at: Date;

  @OneToMany(() => RolesModulesDocument, (roles) => roles.module, {
    cascade: true,
  })
  roles: RolesModulesDocument[];

  @ManyToOne(() => RolesGroupsDocument, (groups) => groups.modules)
  @JoinColumn({ name: 'group_id', referencedColumnName: 'id' })
  groups: RolesGroupsDocument;

  constructor(init?: Partial<RolesPermissionDocument>) {
    Object.assign(this, init);
  }
}
