export interface InternResponse {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  start_date: string | null;
  status: 'Active' | 'Inactive';
}
