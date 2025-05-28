import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../pagination/pagination.component';
import { Score } from '../../models/score';
import { ScoreService } from '../../services/score.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ScoreDialogComponent } from './score-dialog/score-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-scores',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, MatTooltipModule],
  templateUrl: './scores.component.html',
  styleUrl: './scores.component.scss',
})
export class ScoresComponent implements OnInit {
  currentPage: number = 0;
  itemsPerPage: number = 5;
  employeeName: string = '';
  meetingName: string = '';
  meetingDate: string = '';

  get scores$() {
    return this.scoreService.scores$;
  }

  get totalPages$() {
    return this.scoreService.totalPages$;
  }

  constructor(
    private scoreService: ScoreService,
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

    this.scoreService.setSearchParams({
      employeeName: this.employeeName,
      meetingName: this.meetingName,
      meetingDate: this.meetingDate,
      page: this.currentPage,
    });

    this.scoreService
      .getScores(
        this.employeeName,
        this.meetingName,
        this.meetingDate,
        this.currentPage,
        this.itemsPerPage
      )
      .subscribe();
  }

  openScoreDialog(score?: Score) {
    const dialogRef = this.dialog.open(ScoreDialogComponent, {
      width: '500px',
      data: score,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.search();
    });
  }

  detailScore(score: Score) {
    this.openScoreDialog(score);
  }

  deleteScore(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: 'Bạn có chắc muốn xóa điểm của nhân viên này?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.scoreService.deleteScore(id).subscribe({
          next: () => {
            this.snackBar.open('Đã xóa điểm của nhân viên!', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
            this.search();
          },
          error: (error) => {
            console.error('Error deleting score:', error);
            this.snackBar.open('Có lỗi xảy ra khi xóa điểm!', 'Đóng', {
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
