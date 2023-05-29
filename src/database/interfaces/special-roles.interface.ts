export enum EnumSpecialRolesPlatforms {
  NONE = 'NONE',
  SUPERADMIN = 'SUPERADMIN',
  STORES = 'STORES',
  CUSTOMER = 'CUSTOMER',
}

export interface ISpecialRoles {
  id: string;
  code: string;
  name: string;
  platform: EnumSpecialRolesPlatforms;
  role_id?: string;
}
