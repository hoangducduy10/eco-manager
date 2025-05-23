import { EmployeeRole } from './employee-role.enum';

export interface Employee {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  role: EmployeeRole;
  status: 'Active' | 'Inactive';
}
