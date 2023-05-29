import {
  EnumSpecialRolesPlatforms,
  ISpecialRoles,
} from 'src/database/interfaces/special-roles.interface';

export const special_roles: ISpecialRoles[] = [
  {
    id: '49b3eca8-9c84-443b-b5d1-55c2c4a0fbb1',
    code: 'store_cashier',
    name: 'Kasir',
    platform: EnumSpecialRolesPlatforms.CUSTOMER,
  },
  {
    id: '88e5b025-36dc-45a4-8ff6-037367796aec',
    code: 'store_manager',
    name: 'Manager Store',
    platform: EnumSpecialRolesPlatforms.CUSTOMER,
  },
  {
    id: 'd419faee-aad0-411f-8f97-8db2a68bb8c3',
    code: 'Admin',
    name: 'Admin',
    platform: EnumSpecialRolesPlatforms.SUPERADMIN,
  },
  {
    id: 'facc35cf-cea4-40eb-9c0b-1a5c1ff0739d',
    code: 'brand_manager',
    name: 'PIC Brand',
    platform: EnumSpecialRolesPlatforms.STORES,
  },
  {
    id: '0baa3e54-b758-43f4-9e7b-50d62260b643',
    code: 'pic_store',
    name: 'PIC Store',
    platform: EnumSpecialRolesPlatforms.CUSTOMER,
  },
];
