import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '../../../models/product';
import { ProductService } from '../../../services/product.service';
import { CommonModule } from '@angular/common';
import { ProductDto } from '../../../dtos/product/product.dto';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ProductStatus } from '../../../models/product-status.enum';
import { DateUtilsService } from '../../../services/date-utils.service';

export interface ProductDialogData {
  product?: Product;
}

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
  ],
  templateUrl: './product-dialog.component.html',
  styleUrls: ['./product-dialog.component.scss'],
})
export class ProductDialogComponent {
  productForm: FormGroup;
  productStatus = ProductStatus;

  constructor(
    public dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product | null,
    private productService: ProductService,
    private dateUtils: DateUtilsService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      created_at: [null, [Validators.required]],
      status: [ProductStatus.DEVELOPING, [Validators.required]],
    });

    if (this.data) {
      const createdAt = this.data.created_at
        ? this.dateUtils.fromApiFormat(this.data.created_at)
        : null;

      this.productForm.patchValue({
        ...this.data,
        created_at: createdAt,
        status: this.data.status as ProductStatus,
      });
    }
  }

  save(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.value;

    const productData: ProductDto = {
      name: formValue.name,
      description: formValue.description,
      start_date: formValue.created_at
        ? this.dateUtils.toApiFormat(formValue.created_at)
        : '',
      status: formValue.status,
    };

    if (this.data) {
      this.productService.updateProduct(this.data.id, productData).subscribe({
        next: () => {
          this.snackBar.open('Cập nhật sản phẩm thành công!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open('Có lỗi xảy ra khi cập nhật sản phẩm!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
          console.error(error);
        },
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.snackBar.open('Đã thêm sản phẩm thành công!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open('Có lỗi xảy ra khi thêm sản phẩm.', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
          console.error(error);
        },
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(controlName: string): string {
    const control = this.productForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Trường này là bắt buộc';
    }
    if (control?.hasError('maxlength')) {
      return 'Mô tả không được vượt quá 500 ký tự';
    }
    return '';
  }
}
