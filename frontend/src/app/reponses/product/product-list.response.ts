import { Product } from '../../models/product';

export interface ProductListResponse {
  products: Product[];
  totalPages: number;
}
