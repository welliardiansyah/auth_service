import { SpecialRolesDocument } from 'src/database/entities/special-roles.entity';

export class ModuleItemResponse {
  id: string;
  code: string;
  name: string;
  group_id: string;
  platform: string;
  sequence: number;
  active_permissions: string[];
  permissions: string[];

  constructor(init?: Partial<ModuleItemResponse>) {
    Object.assign(this, init);
  }
}

export class ModuleGroupResponse {
  id: string;
  name: string;
  platform: string;
  sequence: string;
  modules: ModuleItemResponse[];

  constructor(init?: Partial<ModuleGroupResponse>) {
    Object.assign(this, init);
  }
}

export class RoleDetailResponse {
  id: string;
  name: string;
  status: string;
  platform: string;
  module_permissions: ModuleGroupResponse[];
  special_role: SpecialRolesDocument;

  constructor(init?: Partial<RoleDetailResponse>) {
    Object.assign(this, init);
  }
}
