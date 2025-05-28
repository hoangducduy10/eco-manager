import { EmployeeRole } from '../../models/employee-role.enum';

export class AssignmentDto {
  productId: number;

  employeeId: number;

  employeeRole: EmployeeRole;

  assigned_date: string;

  end_date?: string | null;

  status: 'Active' | 'Inactive';

  constructor(data: any) {
    this.productId = data.productId;
    this.employeeId = data.employeeId;
    this.employeeRole = data.employeeRole;
    this.assigned_date = data.assigned_date;
    this.end_date = data.end_date;
    this.status = data.status;
  }
}
