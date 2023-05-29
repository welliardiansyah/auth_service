import { SetMetadata } from '@nestjs/common';

export const UserTypeAndLevel = (...user_type_and_levels: string[]) =>
  SetMetadata('user_type_and_levels', user_type_and_levels);
