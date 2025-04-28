import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InternService } from '../../services/intern.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Intern } from '../../models/intern';
import { InternResponse } from '../../reponses/intern/intern.response';
import { PaginationComponent } from '../pagination/pagination.component';
import { InternDialogComponent } from './intern-dialog/intern-dialog.component';

@Component({
  selector: 'app-interns',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './interns.component.html',
  styleUrl: './interns.component.scss',
})
export class InternsComponent implements OnInit {
  interns: Intern[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  fullName: string = '';
  status: boolean | null = null;

  constructor(
    private internService: InternService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getInterns(
      this.fullName,
      this.status,
      this.currentPage,
      this.itemsPerPage
    );
  }

  getInterns(
    fullName: string,
    active: boolean | null,
    page: number,
    size: number
  ) {
    this.internService.getInterns(fullName, active, page, size).subscribe({
      next: (response) => {
        this.interns = response.interns;
        this.totalPages = response.totalPages;
      },
      error: (error) => {
        console.error('Error fetching interns:', error);
      },
    });
  }

  detailIntern(intern: InternResponse) {
    this.openInternDialog(intern);
  }

  onSearch() {
    this.currentPage = 0;
    this.getInterns(
      this.fullName,
      this.status,
      this.currentPage,
      this.itemsPerPage
    );
  }

  openInternDialog(intern?: InternResponse): void {
    const dialogRef = this.dialog.open(InternDialogComponent, {
      width: '500px',
      data: intern || null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Làm mới danh sách sau khi thêm hoặc cập nhật
        this.getInterns(
          this.fullName,
          this.status,
          this.currentPage,
          this.itemsPerPage
        );
      }
    });
  }

  deleteIntern(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa intern này không?')) {
      this.internService.deleteIntern(id).subscribe({
        next: () => {
          this.snackBar.open('Xóa intern thành công!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this.getInterns(
            this.fullName,
            this.status,
            this.currentPage,
            this.itemsPerPage
          );
        },
        error: (error) => {
          this.snackBar.open('Lỗi khi xóa intern.', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
          console.error('Lỗi khi xóa intern:', error);
        },
      });
    }
  }

  onPageChange(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage = page - 1;
      this.getInterns(
        this.fullName,
        this.status,
        this.currentPage,
        this.itemsPerPage
      );
    }
  }
}
