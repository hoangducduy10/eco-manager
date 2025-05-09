import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProductListResponse } from '../reponses/product/product-list.response';
import { Product } from '../models/product';
import { ProductStatus } from '../models/product-status.enum';
import { ProductDto } from '../dtos/product/product.dto';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiGetProducts = `${environment.apiBaseUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(
    name: string,
    status: ProductStatus | null,
    page: number,
    size: number
  ): Observable<ProductListResponse> {
    let params = new HttpParams()
      .set('name', name)
      .set('status', status ? status : '')
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ProductListResponse>(this.apiGetProducts, { params });
  }

  createProduct(product: ProductDto): Observable<Product> {
    return this.http.post<Product>(`${this.apiGetProducts}/create`, product);
  }

  updateProduct(id: number, product: ProductDto): Observable<Product> {
    return this.http.put<Product>(
      `${this.apiGetProducts}/update/${id}`,
      product
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiGetProducts}/${id}`);
  }

  deleteProduct(id: number) {
    return this.http.delete(`${this.apiGetProducts}/delete/${id}`);
  }
}
