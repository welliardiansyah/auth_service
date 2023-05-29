import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Platform } from 'src/database/enums/roles.enum';

export class BaseModulePermissionDto {
  module_id: string;
  permissions: string[];
}

export class CreateRolesDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  status: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Platform, {
    message: `Acceptable ENUM is : ['${Platform.SUPERADMIN}', '${Platform.STORES}', '${Platform.CUSTOMER}']`,
  })
  platform: string;

  @IsNotEmpty()
  @IsArray()
  module_permissions: BaseModulePermissionDto[];
}

export class CreateModulePermissionDto {
  group_id: string;

  @IsString()
  @IsOptional()
  code: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Platform, {
    message: `Acceptable ENUM is : ['${Platform.SUPERADMIN}', '${Platform.STORES}', '${Platform.CUSTOMER}']`,
  })
  platform: string;

  sequence: number;

  @IsString({ each: true })
  @IsOptional()
  permissions: string[];
}

export class RolesQueryFilter {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit: number;

  @IsString()
  @IsOptional()
  search: string;

  @IsString()
  @IsOptional()
  status: string;

  @IsString()
  @IsOptional()
  platform: Platform;
}
