import { PartialType } from '@nestjs/mapped-types';
import { CreateInternalDto } from './create-internal.dto';

export class UpdateInternalDto extends PartialType(CreateInternalDto) {}
