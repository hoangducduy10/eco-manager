import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InternService } from '../../services/intern.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Intern } from '../../models/intern';
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
  interns: Intern[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  fullName: string = '';
  status: boolean | null = null;

  private searchTerms = new Subject<{
    fullName: string;
    status: boolean | null;
    page: number;
  }>();
  private searchSubscription?: Subscription;

  constructor(
    private internService: InternService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (a, b) =>
            a.fullName === b.fullName &&
            a.status === b.status &&
            a.page === b.page
        ),
        switchMap((params) =>
          this.internService.getInterns(
            params.fullName,
            params.status,
            params.page,
            this.itemsPerPage
          )
        )
      )
      .subscribe({
        next: (response) => {
          this.interns = response.interns;
          this.totalPages = response.totalPages;
        },
        error: (error) => {
          console.error('Error fetching interns:', error);
        },
      });

    this.search();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  detailIntern(intern: InternResponse) {
    this.openInternDialog(intern);
  }

  search(resetPage: boolean = false) {
    if (resetPage) {
      this.currentPage = 0;
    }

    this.searchTerms.next({
      fullName: this.fullName,
      status: this.status,
      page: this.currentPage,
    });
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
