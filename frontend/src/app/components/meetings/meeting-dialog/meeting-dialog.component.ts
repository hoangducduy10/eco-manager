import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MeetingService } from '../../../services/meeting.service';
import { Meeting } from '../../../models/meeting';
import { MeetingResponse } from '../../../reponses/meeting/meeting.response';
import { MeetingDto } from '../../../dtos/meeting/meeting.dto';
import { DateUtilsService } from '../../../services/date-utils.service';

@Component({
  selector: 'app-meeting-dialog',
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
    MatNativeDateModule,
  ],
  templateUrl: './meeting-dialog.component.html',
  styleUrl: './meeting-dialog.component.scss',
})
export class MeetingDialogComponent {
  meetingForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<MeetingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Meeting | null,
    private meetingService: MeetingService,
    private dateUtils: DateUtilsService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.meetingForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      meeting_date: [null, [Validators.required]],
    });

    if (this.data) {
      const meetingDate = this.data.meeting_date
        ? this.dateUtils.fromApiFormat(this.data.meeting_date)
        : null;

      this.meetingForm.patchValue({
        title: this.data.title,
        description: this.data.description,
        meeting_date: meetingDate,
      });
    }
  }

  save() {
    if (this.meetingForm.invalid) {
      this.meetingForm.markAllAsTouched();
      return;
    }

    const formValue = this.meetingForm.value;

    if (!(formValue.meeting_date instanceof Date)) {
      this.snackBar.open('Ngày họp không hợp lệ!', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
      return;
    }

    const meetingDto: MeetingDto = {
      title: formValue.title,
      description: formValue.description || '',
      meeting_date: this.dateUtils.toApiFormat(formValue.meeting_date),
    };

    if (this.data?.id) {
      this.meetingService.updateMeeting(this.data.id, meetingDto).subscribe({
        next: () => {
          this.snackBar.open('Đã cập nhật cuộc họp thành công!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open('Có lỗi xảy ra khi cập nhật cuộc họp!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
          console.error(error);
        },
      });
    } else {
      this.meetingService.createMeeting(meetingDto).subscribe({
        next: () => {
          this.snackBar.open('Đã tạo cuộc họp thành công!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open('Có lỗi xảy ra khi tạo cuộc họp!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
          console.error(error);
        },
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  getErrorMessage(controlName: string): string {
    const control = this.meetingForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Trường này là bắt buộc';
    }
    if (control?.hasError('email')) {
      return 'Email không hợp lệ';
    }
    return '';
  }
}
