import { IsOptional } from 'class-validator';

export class ListSpecialRolesDto {
  @IsOptional()
  search: string;

  // @IsOptional()
  // @Type(() => Number)
  // @IsNumber({}, { message: 'Limit bukan format number' })
  // limit: number;

  // @IsOptional()
  // @Type(() => Number)
  // @IsNumber({}, { message: 'Limit bukan format number' })
  // page: number;
}
