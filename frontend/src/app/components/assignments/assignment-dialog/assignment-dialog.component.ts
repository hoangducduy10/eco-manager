import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatOptionModule } from '@angular/material/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Product } from '../../../models/product';
import { Employee } from '../../../models/employee';
import { EmployeeService } from '../../../services/employee.service';
import { ProductService } from '../../../services/product.service';
import { EmployeeRole } from '../../../models/employee-role.enum';
import { DateUtilsService } from '../../../services/date-utils.service';
import { AssignmentDto } from '../../../dtos/assignment/assignment.dto';
import { AssignmentService } from '../../../services/assignment.service';
import { combineLatest } from 'rxjs';
import { Assignment } from '../../../models/assignment';

@Component({
  selector: 'app-assignment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './assignment-dialog.component.html',
  styleUrl: './assignment-dialog.component.scss',
})
export class AssignmentDialogComponent implements OnInit {
  assignmentForm: FormGroup;
  products: Product[] = [];
  employees: Employee[] = [];
  roles = EmployeeRole;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private assignmentService: AssignmentService,
    private employeeService: EmployeeService,
    private productService: ProductService,
    private dateUtils: DateUtilsService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AssignmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Assignment | null
  ) {
    this.assignmentForm = this.fb.group({
      employeeId: [null, Validators.required],
      productId: [null, Validators.required],
      role: [null, Validators.required],
      assigned_date: [null, Validators.required],
      end_date: [{ value: null, disabled: true }],
      status: ['active', Validators.required],
    });
  }

  ngOnInit(): void {
    combineLatest([
      this.productService.getProducts('', null, 0, 1000),
      this.employeeService.getEmployees('', null, null, 0, 1000),
    ]).subscribe(([productsResponse, employeesResponse]) => {
      this.products = productsResponse.items;
      this.employees = employeesResponse.items;

      if (this.data) {
        this.patchFormWithData();
      }
    });
  }

  private patchFormWithData(): void {
    const { employee, product, role, assigned_date, end_date, status } =
      this.data!;
    this.assignmentForm.patchValue({
      employeeId: employee?.id || null,
      productId: product?.id || null,
      role,
      assigned_date: this.safeParseDate(assigned_date),
      end_date: this.safeParseDate(end_date),
      status: status || 'active',
    });

    this.onStatusChange(status || 'active');
  }

  private safeParseDate(dateStr?: string): Date | null {
    if (!dateStr) return null;
    try {
      return this.dateUtils.fromApiFormat(dateStr);
    } catch {
      return new Date(dateStr);
    }
  }

  save(): void {
    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      this.showValidationErrors();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.assignmentForm.getRawValue();

    console.log('--- Save clicked ---');
    console.log('Raw form value:', formValue);
    console.log(
      'Type of assigned_date:',
      typeof formValue.assigned_date,
      formValue.assigned_date
    );
    console.log(
      'Is assigned_date instance of Date:',
      formValue.assigned_date instanceof Date
    );
    console.log(
      'Is assigned_date valid date:',
      formValue.assigned_date && !isNaN(formValue.assigned_date.getTime())
    );

    const assignedDate = this.safeFormatDate(
      formValue.assigned_date,
      'Ngày phân công'
    );
    console.log('Formatted assignedDate:', assignedDate);
    if (!assignedDate) return;

    const endDate =
      formValue.status === 'inactive'
        ? this.safeFormatDate(formValue.end_date, 'Ngày kết thúc')
        : null;
    if (formValue.status === 'inactive' && !endDate) return;

    const payload: AssignmentDto = {
      employeeId: formValue.employeeId,
      productId: formValue.productId,
      employeeRole: formValue.role,
      assigned_date: assignedDate,
      end_date: endDate,
      status: formValue.status,
    };

    console.log('Payload sent to API:', payload);

    const request$ = this.data
      ? this.assignmentService.updateAssignment(this.data.id, payload)
      : this.assignmentService.createAssignment(payload);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          this.data ? 'Cập nhật thành công!' : 'Thêm mới thành công!',
          'Đóng',
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          }
        );
        this.dialogRef.close(true);
      },
      error: () => {
        this.showError(
          this.data
            ? 'Có lỗi xảy ra khi cập nhật!'
            : 'Có lỗi xảy ra khi thêm mới!'
        );
      },
      complete: () => (this.isSubmitting = false),
    });
  }

  private safeFormatDate(date: any, errorMsg: string): string | null {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      this.showError(`${errorMsg} không hợp lệ!`);
      this.isSubmitting = false;
      return null;
    }
    return this.dateUtils.toApiFormat(date);
  }

  onStatusChange(status: string): void {
    const endDateControl = this.assignmentForm.get('end_date');
    if (!endDateControl) return;

    if (status === 'inactive') {
      endDateControl.enable();
      if (!endDateControl.value) endDateControl.setValue(new Date());
    } else {
      endDateControl.disable();
      endDateControl.setValue(null);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(controlName: string): string {
    return this.assignmentForm.get(controlName)?.hasError('required')
      ? 'Trường này là bắt buộc'
      : '';
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }

  private showValidationErrors(): void {
    const messages: string[] = [];
    Object.keys(this.assignmentForm.controls).forEach((key) => {
      const control = this.assignmentForm.get(key);
      if (control?.hasError('required')) {
        messages.push(`${this.getFieldLabel(key)} là bắt buộc`);
      }
    });
    if (messages.length) this.showError(messages.join(', '));
  }

  private getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      employeeId: 'Nhân viên',
      productId: 'Sản phẩm',
      role: 'Vai trò',
      assigned_date: 'Ngày phân công',
      end_date: 'Ngày kết thúc',
      status: 'Trạng thái',
    };
    return labels[field] || field;
  }
}
