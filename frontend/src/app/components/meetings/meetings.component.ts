import { Component, OnInit } from '@angular/core';
import { Meeting } from '../../models/meeting';
import { PaginationComponent } from '../pagination/pagination.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeetingService } from '../../services/meeting.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MeetingResponse } from '../../reponses/meeting/meeting.response';
import { MeetingDialogComponent } from './meeting-dialog/meeting-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, MatTooltipModule],
  templateUrl: './meetings.component.html',
  styleUrl: './meetings.component.scss',
})
export class MeetingsComponent implements OnInit {
  currentPage: number = 0;
  itemsPerPage: number = 5;
  title: string = '';
  meetingDate: string = '';

  get meetings$() {
    return this.meetingService.meetings$;
  }

  get totalPages$() {
    return this.meetingService.totalPages$;
  }

  constructor(
    private meetingService: MeetingService,
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

    this.meetingService.setSearchParams({
      title: this.title,
      meetingDate: this.meetingDate,
      page: this.currentPage,
    });

    this.meetingService
      .getMeetings(
        this.title,
        this.meetingDate,
        this.currentPage,
        this.itemsPerPage
      )
      .subscribe();
  }

  openMeetingDialog(meeting?: MeetingResponse) {
    const dialogRef = this.dialog.open(MeetingDialogComponent, {
      width: '500px',
      data: meeting,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.search();
    });
  }

  detailMeeting(meeting: MeetingResponse) {
    this.openMeetingDialog(meeting);
  }

  deleteMeeting(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: 'Bạn có chắc chắn muốn xóa cuộc họp này?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.meetingService.deleteMeeting(id).subscribe({
          next: () => {
            this.snackBar.open('Xóa cuộc họp thành công', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
            this.search();
          },
          error: (error) => {
            console.error('Error deleting meeting:', error);
            this.snackBar.open('Xóa cuộc họp thất bại', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            });
            console.error('Lỗi khi xóa cuộc họp:', error);
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
