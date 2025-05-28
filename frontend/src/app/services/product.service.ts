import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import {
  BehaviorSubject,
  Observable,
  debounceTime,
  switchMap,
  tap,
} from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product } from '../models/product';
import { ProductStatus } from '../models/product-status.enum';
import { ProductDto } from '../dtos/product/product.dto';
import { ListResponse } from '../reponses/list-response';

interface SearchParams {
  name: string;
  status: ProductStatus | null;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiGetProducts = `${environment.apiBaseUrl}/products`;

  private searchParamsSubject = new BehaviorSubject<SearchParams>({
    name: '',
    status: null,
    page: 0,
    size: 5,
  });

  private productsSubject = new BehaviorSubject<Product[]>([]);
  private totalPagesSubject = new BehaviorSubject<number>(0);

  products$ = this.productsSubject.asObservable();
  totalPages$ = this.totalPagesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.searchParamsSubject
      .asObservable()
      .pipe(
        debounceTime(300),
        switchMap((params) =>
          this.getProducts(params.name, params.status, params.page, params.size)
        ),
        tap((response) => {
          this.productsSubject.next(response.items);
          this.totalPagesSubject.next(response.totalPages);
        })
      )
      .subscribe();
  }

  getProducts(
    name: string,
    status: ProductStatus | null,
    page: number,
    size: number
  ): Observable<ListResponse<Product>> {
    let params = new HttpParams()
      .set('name', name)
      .set('status', status ?? '')
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ListResponse<Product>>(this.apiGetProducts, {
      params,
    });
  }

  setSearchParams(params: Partial<SearchParams>) {
    const current = this.searchParamsSubject.value;
    this.searchParamsSubject.next({ ...current, ...params });
  }

  refreshCurrentPage() {
    const current = this.searchParamsSubject.value;
    this.searchParamsSubject.next({ ...current });
  }

  createProduct(product: ProductDto): Observable<Product> {
    return this.http
      .post<Product>(`${this.apiGetProducts}/create`, product)
      .pipe(tap(() => this.refreshCurrentPage()));
  }

  updateProduct(id: number, product: ProductDto): Observable<Product> {
    return this.http
      .put<Product>(`${this.apiGetProducts}/update/${id}`, product)
      .pipe(tap(() => this.refreshCurrentPage()));
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiGetProducts}/${id}`);
  }

  deleteProduct(id: number) {
    return this.http
      .delete(`${this.apiGetProducts}/delete/${id}`)
      .pipe(tap(() => this.refreshCurrentPage()));
  }
}
