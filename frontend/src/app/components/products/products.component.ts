import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '../../models/product';
import { ProductResponse } from '../../reponses/product/product.response';
import { PaginationComponent } from '../pagination/pagination.component';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductStatus } from '../../models/product-status.enum';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, MatTooltipModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  productStatus = ProductStatus;
  currentPage: number = 0;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  name: string = '';
  status: ProductStatus | null = null;

  private searchTerms = new Subject<{
    name: string;
    status: ProductStatus | null;
    page: number;
  }>();

  private searchSubscription?: Subscription;

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (a, b) =>
            a.name === b.name && a.status === b.status && a.page === b.page
        ),
        switchMap((params) =>
          this.productService.getProducts(
            params.name,
            params.status,
            params.page,
            this.itemsPerPage
          )
        )
      )
      .subscribe({
        next: (response) => {
          this.products = response.products;
          this.totalPages = response.totalPages;
        },
        error: (error) => {
          console.error('Error fetching products:', error);
        },
      });

    this.search();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  getProducts(
    name: string,
    status: ProductStatus | null,
    page: number,
    size: number
  ) {
    this.productService.getProducts(name, status, page, size).subscribe({
      next: (response) => {
        this.products = response.products;
        this.totalPages = response.totalPages;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      },
    });
  }

  detailProduct(product: ProductResponse) {
    this.openProductDialog(product);
  }

  search(resetPage: boolean = false) {
    if (resetPage) {
      this.currentPage = 0;
    }
    this.searchTerms.next({
      name: this.name,
      status: this.status,
      page: this.currentPage,
    });
  }

  openProductDialog(product?: ProductResponse): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '500px',
      data: product || null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.search();
    });
  }

  deleteProduct(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: 'Bạn có chắc chắn muốn xóa sản phẩm này không?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.productService.deleteProduct(id).subscribe({
          next: () => {
            this.snackBar.open('Đã xóa sản phẩm thành công!', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
            this.search();
          },
          error: (error) => {
            this.snackBar.open('Có lỗi xảy ra khi xóa sản phẩm.', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            });
            console.error('Lỗi khi xóa sản phẩm:', error);
          },
        });
      }
    });
  }

  onPageChange(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage = page - 1;
      this.search();
    }
  }
}
