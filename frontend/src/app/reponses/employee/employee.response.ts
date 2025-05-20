export interface EmployeeResponse {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  role: 'LEADER' | 'DEVELOPER' | 'TESTER';
  status: 'Active' | 'Inactive';
}
