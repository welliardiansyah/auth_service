import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Platform } from '../enums/roles.enum';
import { RolesPermissionDocument } from './roles-permission.entity';

@Entity({ name: 'auth_module_groups' })
export class RolesGroupsDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', default: null })
  name: string;

  @Column({ type: 'enum', enum: Platform, default: Platform.NONE })
  platform: string;

  @Column({ type: 'int', default: null })
  sequence: number;

  @Exclude()
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at: Date;

  @OneToMany(() => RolesPermissionDocument, (modules) => modules.groups)
  modules: RolesPermissionDocument;

  constructor(init?: Partial<RolesGroupsDocument>) {
    Object.assign(this, init);
  }
}
