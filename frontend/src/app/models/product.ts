import { ProductStatus } from './product-status.enum';

export interface Product {
  id: number;
  name: string;
  description: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}
