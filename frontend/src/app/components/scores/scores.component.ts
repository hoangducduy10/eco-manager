import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../pagination/pagination.component';
import { Score } from '../../models/score';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { ScoreService } from '../../services/score.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ScoreResponse } from '../../reponses/score/score.response';
import { ScoreDialogComponent } from './score-dialog/score-dialog.component';

@Component({
  selector: 'app-scores',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './scores.component.html',
  styleUrl: './scores.component.scss',
})
export class ScoresComponent implements OnInit {
  scores: Score[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  employeeName: string = '';
  meetingName: string = '';
  meetingDate: string = '';

  private searchTerms = new Subject<{
    employeeName: string;
    meetingName: string;
    meetingDate: string;
    page: number;
  }>();

  private searchSubscription?: Subscription;

  constructor(
    private scoreService: ScoreService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (a, b) =>
            a.employeeName === b.employeeName &&
            a.meetingName === b.meetingName &&
            a.meetingDate === b.meetingDate &&
            a.page === b.page
        ),
        switchMap((params) =>
          this.scoreService.getScores(
            params.employeeName,
            params.meetingName,
            params.meetingDate,
            params.page,
            this.itemsPerPage
          )
        )
      )
      .subscribe({
        next: (response) => {
          // Map từ ScoreResponse sang Score
          this.scores = response.scores.map(item => ({
            id: item.id,
            employee: {
              id: item.employeeId,
              fullName: item.employeeName
            },
            meeting: {
              id: item.meetingId,
              title: item.meetingName,
              meetingDate: item.meetingDate
            },
            score: item.score,
            comment: item.comment,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          }));
          this.totalPages = response.totalPages;
        },
        error: (error) => {
          console.error('Error fetching scores:', error);
        },
      });

    this.search();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  getScores(
    employeeName: string,
    meetingName: string,
    meetingDate: string,
    page: number
  ) {
    this.scoreService
      .getScores(
        employeeName,
        meetingName,
        meetingDate,
        page,
        this.itemsPerPage
      )
      .subscribe({
        next: (response) => {
          // Map từ ScoreResponse sang Score
          this.scores = response.scores.map(item => ({
            id: item.id,
            employee: {
              id: item.employeeId,
              fullName: item.employeeName
            },
            meeting: {
              id: item.meetingId,
              title: item.meetingName,
              meetingDate: item.meetingDate
            },
            score: item.score,
            comment: item.comment,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          }));
          this.totalPages = response.totalPages;
        },
        error: (error) => {
          console.error('Error fetching scores:', error);
        },
      });
  }

  search(resetPage: boolean = false) {
    if (resetPage) {
      this.currentPage = 0;
    }
    this.searchTerms.next({
      employeeName: this.employeeName,
      meetingName: this.meetingName,
      meetingDate: this.meetingDate,
      page: this.currentPage,
    });
  }

  detailScore(score: Score) {
    const scoreResponse: ScoreResponse = {
      id: score.id,
      employeeId: score.employee.id,
      meetingId: score.meeting.id,
      employeeName: score.employee.fullName,
      meetingName: score.meeting.title,
      meetingDate: score.meeting.meetingDate,
      score: score.score,
      comment: score.comment,
    };
    this.openScoreDialog(scoreResponse);
  }

  openScoreDialog(score?: ScoreResponse): void {
    const dialogRef = this.dialog.open(ScoreDialogComponent, {
      width: '500px',
      data: score || null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.search();
    });
  }

  deleteScore(id: number): void {
    const dialogRef = this.dialog.open(ScoreDialogComponent, {
      width: '400px',
      data: { message: 'Bạn có chắc chắn muốn xóa sản phẩm này không?' },
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
            this.snackBar.open('Có lỗi xảy ra khi xóa điểm!', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            });
            console.error('Lỗi khi xóa điểm của nhân viên:', error);
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
