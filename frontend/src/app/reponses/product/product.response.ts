export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  status: 'DEVELOPING' | 'COMPLETED' | 'PAUSED';
  created_at: string;
  updated_at: string;
}
