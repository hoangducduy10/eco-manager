import { IsNotEmpty, IsString } from 'class-validator';
import { ProductStatus } from '../../models/product-status.enum';

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  description: string;

  start_date: string;

  status: ProductStatus;

  constructor(data: any) {
    this.name = data.name;
    this.description = data.description;
    this.start_date = data.start_date;
    this.status = data.status;
  }
}
