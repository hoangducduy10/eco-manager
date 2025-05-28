import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { EmployeeRole } from '../../../models/employee-role.enum';
import { Employee } from '../../../models/employee';
import { EmployeeService } from '../../../services/employee.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-employee-dialog',
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
  templateUrl: './employee-dialog.component.html',
  styleUrl: './employee-dialog.component.scss',
})
export class EmployeeDialogComponent {
  employeeForm: FormGroup;
  employeeRole = EmployeeRole;

  constructor(
    public dialogRef: MatDialogRef<EmployeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Employee | null,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.employeeForm = this.fb.group({
      full_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone_number: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{10}$')],
      ],
      role: [EmployeeRole.DEVELOPER, [Validators.required]],
      status: ['Active', [Validators.required]],
    });

    if (this.data) {
      this.employeeForm.patchValue({
        ...this.data,
        role: this.data.role as EmployeeRole,
      });
    }
  }

  save() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const formValue = this.employeeForm.value;

    const employeeData: Employee = {
      id: this.data?.id || 0,
      full_name: formValue.full_name,
      email: formValue.email,
      phone_number: formValue.phone_number,
      role: formValue.role,
      status: formValue.status,
    };

    if (employeeData.id === 0) {
      this.employeeService.createEmployee(employeeData).subscribe({
        next: () => {
          this.snackBar.open('Thêm nhân viên thành công!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open('Có lỗi xảy ra khi thêm nhân viên!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
          console.error(error);
        },
      });
    } else {
      this.employeeService
        .updateEmployee(employeeData.id, employeeData)
        .subscribe({
          next: () => {
            this.snackBar.open('Cập nhật nhân viên thành công!', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Create error:', err);
            this.snackBar.open(
              'Có lỗi xảy ra khi cập nhật nhân viên.',
              'Đóng',
              {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['error-snackbar'],
              }
            );
          },
        });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(controlName: string): string {
    const control = this.employeeForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Trường này là bắt buộc!';
    }
    if (control?.hasError('email')) {
      return 'Email không hợp lệ!';
    }
    if (control?.hasError('pattern')) {
      return 'Số điện thoại phải có 10 chữ số!';
    }
    return '';
  }
}
