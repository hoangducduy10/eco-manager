import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../pagination/pagination.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmployeeRole } from '../../models/employee-role.enum';
import { EmployeeService } from '../../services/employee.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeResponse } from '../../reponses/employee/employee.response';
import { EmployeeDialogComponent } from './employee-dialog/employee-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, MatTooltipModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss',
})
export class EmployeesComponent implements OnInit {
  fullName: string = '';
  employeeRole = EmployeeRole;
  role: EmployeeRole | null = null;
  status: boolean | null = null;
  currentPage: number = 0;
  itemsPerPage: number = 5;

  constructor(
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  get employees$() {
    return this.employeeService.employees$;
  }

  get totalPage$() {
    return this.employeeService.totalPages$;
  }

  ngOnInit(): void {
    this.search();
  }

  search(resetPage: boolean = false) {
    if (resetPage) {
      this.currentPage = 0;
    }

    this.employeeService.setSearchParams({
      fullName: this.fullName,
      role: this.role,
      active: this.status,
      page: this.currentPage,
    });

    this.employeeService
      .getEmployees(
        this.fullName,
        this.role,
        this.status,
        this.currentPage,
        this.itemsPerPage
      )
      .subscribe();
  }

  openEmployeeDialog(employee?: EmployeeResponse) {
    const dialogRef = this.dialog.open(EmployeeDialogComponent, {
      width: '500px',
      data: employee,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.search();
    });
  }

  detailEmployee(employee: EmployeeResponse) {
    this.openEmployeeDialog(employee);
  }

  deleteEmployee(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: 'Bạn có chắc chắn muốn xóa nhân viên này?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.employeeService.deleteEmployee(id).subscribe({
          next: () => {
            this.snackBar.open('Xóa nhân viên thành công', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
            this.search();
          },
          error: (error) => {
            console.error('Error deleting employee:', error);
            this.snackBar.open('Xóa nhân viên thất bại', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            });
            console.error('Lỗi khi xóa nhân viên:', error);
          },
        });
      }
    });
  }

  onPageChange(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage = (page ?? 1) - 1;
      this.search();
    }
  }
}
