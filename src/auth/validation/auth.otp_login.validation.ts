import {
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class AuthOtpLoginValidation {
  @IsOptional()
  @IsNumberString()
  @Length(10, 15)
  phone: string;

  @IsOptional()
  email: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsNotEmpty()
  @Length(4, 4)
  @IsNumberString()
  otp_code: string;

  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsIn(['customer', 'merchant', 'admin'])
  user_type: string;

  @IsOptional()
  @IsIn(['group', 'merchant', 'store'])
  level: string; //khusus user type=merchant

  roles: string[]; // (customer/merchant/admin)
  group_id: string;
  merchant_id: string;
  store_id: string;
  apps_id: string;

  @IsOptional()
  @IsNumberString()
  @Length(10, 15)
  phone_new: string;

  @IsOptional()
  created_at: Date;
}
