import { Role } from '../../models/role';

export interface UserResponse {
  id: number;
  name: string;
  phone_number: string;
  is_active: boolean;
  role: Role;
}
