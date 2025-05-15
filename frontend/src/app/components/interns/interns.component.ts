import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InternService } from '../../services/intern.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InternResponse } from '../../reponses/intern/intern.response';
import { PaginationComponent } from '../pagination/pagination.component';
import { InternDialogComponent } from './intern-dialog/intern-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-interns',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, MatTooltipModule],
  templateUrl: './interns.component.html',
  styleUrl: './interns.component.scss',
})
export class InternsComponent implements OnInit {
  currentPage: number = 0;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  fullName: string = '';
  status: boolean | null = null;

  get interns$() {
    return this.internService.interns$;
  }

  get totalPages$() {
    return this.internService.totalPages$;
  }

  constructor(
    private internService: InternService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.search();
  }

  detailIntern(intern: InternResponse) {
    this.openInternDialog(intern);
  }

  openInternDialog(intern?: InternResponse): void {
    const dialogRef = this.dialog.open(InternDialogComponent, {
      width: '500px',
      data: intern || null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.search();
    });
  }

  search(resetPage: boolean = false) {
    if (resetPage) {
      this.currentPage = 0;
    }

    this.internService.setSearchParams({
      fullName: this.fullName,
      active: this.status,
      page: this.currentPage,
    });

    this.internService
      .getInterns(
        this.fullName,
        this.status,
        this.currentPage,
        this.itemsPerPage
      )
      .subscribe();
  }

  deleteIntern(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: 'Bạn có chắc chắn muốn xóa intern này không?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.internService.deleteIntern(id).subscribe({
          next: () => {
            this.snackBar.open('Đã xóa intern thành công!', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
            this.search();
          },
          error: (error) => {
            this.snackBar.open('Có lỗi xảy ra khi xóa intern.', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            });
            console.error('Lỗi khi xóa intern:', error);
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
