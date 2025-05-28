import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../pagination/pagination.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AssignmentService } from '../../services/assignment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Assignment } from '../../models/assignment';
import { AssignmentDialogComponent } from './assignment-dialog/assignment-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, MatTooltipModule],
  templateUrl: './assignments.component.html',
  styleUrl: './assignments.component.scss',
})
export class AssignmentsComponent implements OnInit {
  currentPage: number = 0;
  itemsPerPage: number = 5;
  productName: string = '';
  employeeName: string = '';
  assignedDate: string = '';

  get assignment$() {
    return this.assignmentService.assignments$;
  }

  get totalPages$() {
    return this.assignmentService.totalPages$;
  }

  constructor(
    private assignmentService: AssignmentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.search();
  }

  search(resetPage: boolean = false) {
    if (resetPage) {
      this.currentPage = 0;
    }

    this.assignmentService.setSearchParams({
      productName: this.productName,
      employeeName: this.employeeName,
      assignedDate: this.assignedDate,
      page: this.currentPage,
    });

    this.assignmentService
      .getAssignments(
        this.productName,
        this.employeeName,
        this.assignedDate,
        this.currentPage,
        this.itemsPerPage
      )
      .subscribe();
  }

  openAssignmentDialog(assignment?: Assignment) {
    const dialogRef = this.dialog.open(AssignmentDialogComponent, {
      width: '500px',
      data: assignment,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.search();
    });
  }

  detailAssignment(assignment: Assignment) {
    this.openAssignmentDialog(assignment);
  }

  deleteAssignment(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: 'Bạn có chắc muốn xóa không?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.assignmentService.deleteAssignment(id).subscribe({
          next: () => {
            this.snackBar.open('Đã xóa thành công!', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
            this.search();
          },
          error: (error) => {
            console.error('Error deleting assignment:', error);
            this.snackBar.open('Có lỗi xảy ra khi xóa!', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            });
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
