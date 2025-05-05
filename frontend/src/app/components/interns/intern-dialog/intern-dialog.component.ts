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
import { Intern } from '../../../models/intern';
import { InternService } from '../../../services/intern.service';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-intern-dialog',
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
    MatNativeDateModule,
  ],
  templateUrl: './intern-dialog.component.html',
  styleUrl: './intern-dialog.component.scss',
})
export class InternDialogComponent {
  internForm: FormGroup;
  minDate: Date;
  maxDate: Date;

  constructor(
    public dialogRef: MatDialogRef<InternDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Intern | null,
    private internService: InternService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    // Set min and max date for datepicker
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 100, 0, 1);
    this.maxDate = new Date();

    this.internForm = this.fb.group({
      full_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone_number: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{10}$')],
      ],
      start_date: [null, [Validators.required]],
      status: ['Active', [Validators.required]],
    });

    if (this.data) {
      this.internForm.patchValue({
        ...this.data,
        start_date: this.data.start_date
          ? new Date(this.data.start_date)
          : null,
      });
    }
  }

  save(): void {
    if (this.internForm.invalid) {
      this.internForm.markAllAsTouched();
      return;
    }

    const formValue = this.internForm.value;
    const internData: Intern = {
      id: this.data?.id || 0,
      full_name: formValue.full_name,
      email: formValue.email,
      phone_number: formValue.phone_number,
      start_date: formValue.start_date
        ? this.formatDate(formValue.start_date)
        : '',
      status: formValue.status,
    };

    if (internData.id === 0) {
      this.internService.createIntern(internData).subscribe({
        next: () => {
          this.snackBar.open('Đã thêm intern thành công!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open('Có lỗi xảy ra khi thêm intern.', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
          console.error(error);
        },
      });
    } else {
      this.internService.updateIntern(internData.id, internData).subscribe({
        next: () => {
          this.snackBar.open('Đã cập nhật intern thành công!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open('Có lỗi xảy ra khi cập nhật intern.', 'Đóng', {
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
    const control = this.internForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Trường này là bắt buộc';
    }
    if (control?.hasError('email')) {
      return 'Email không hợp lệ';
    }
    if (control?.hasError('pattern')) {
      return 'Số điện thoại phải có 10 chữ số';
    }
    return '';
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
