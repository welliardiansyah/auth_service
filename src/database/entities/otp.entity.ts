import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'auth_otp' })
export class OtpDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: '15', nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  referral_code: string;

  @Column()
  otp_code: string;

  @Column({ nullable: true, type: 'uuid' })
  apps_id: string;

  @Column({ nullable: true, type: 'uuid' })
  group_id: string;

  @Column()
  user_type: string;

  @Column({ default: false })
  validated: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true, default: null })
  deleted_at: Date;

  id_otp: string;
}
