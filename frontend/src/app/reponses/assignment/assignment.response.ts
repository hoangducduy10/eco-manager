export interface AssignmentResponse {
  id: number;
  productId: number;
  employeeId: number;
  productName: string;
  employeeName: string;
  role: string;
  assigned_date: string;
  end_date: string;
  status: 'active' | 'inactive';
}
