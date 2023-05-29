import { SetMetadata } from '@nestjs/common';

export const UserType = (...user_types: string[]) =>
  SetMetadata('user_types', user_types);
