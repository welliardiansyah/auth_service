export enum UserType {
  Customer = 'customer',
  Merchant = 'merchant',
  Admin = 'admin',
}

export enum Role {
  Customer = 'customer',
  Merchant = 'merchant',
}

export enum Level {
  Group = 'group',
  Merchant = 'merchant',
  Store = 'store',
}

export interface User {
  id: string;
  user_type: UserType;
  role: Role;
  level: Level;
}
