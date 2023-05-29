import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateSpecialRoleDto {
  @IsNotEmpty()
  @IsUUID()
  role_id: string;
}
