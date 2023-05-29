import { IModuleGroup } from 'src/database/interfaces/module-group.interface';

export const rolesGroups: IModuleGroup[] = [
  {
    id: '63756a8e-b878-471e-b5d5-8480a25d1b43',
    name: 'Kelola',
    platform: 'SUPERADMIN',
    sequence: 1,
  },
  {
    id: '14ddbd8d-4751-4098-9c1e-f0ab8c9089fd',
    name: 'User',
    platform: 'SUPERADMIN',
    sequence: 2,
  },
  {
    id: '3b7bc3e2-d976-4af2-9356-1dcb3257029b',
    name: 'Setting',
    platform: 'SUPERADMIN',
    sequence: 3,
  },
  {
    id: '6726ffcb-7c7a-4e90-ab9a-e4a9fd02c685',
    name: 'Kelola',
    platform: 'CUSTOMER',
    sequence: 1,
  },
  {
    id: '70da62a3-153b-4b4c-87fa-ed77856d9eca',
    name: 'Transaksi',
    platform: 'CUSTOMER',
    sequence: 2,
  },
  {
    id: '993869cf-029d-4e35-a144-0c6154be259f',
    name: 'Kelola',
    platform: 'STORES',
    sequence: 1,
  },
  {
    id: 'd539cad7-0101-40b7-9a39-5d010aa5a53e',
    name: 'User',
    platform: 'STORES',
    sequence: 2,
  },
];
