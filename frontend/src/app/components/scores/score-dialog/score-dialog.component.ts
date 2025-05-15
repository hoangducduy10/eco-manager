import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatOptionModule } from '@angular/material/core';

import { ScoreService } from '../../../services/score.service';
import { ScoreDto } from '../../../dtos/score/score.dto';
import { Score } from '../../../models/score';

@Component({
  selector: 'app-score-dialog',
  standalone: true,
  templateUrl: './score-dialog.component.html',
  styleUrls: ['./score-dialog.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
  ],
})
export class ScoreDialogComponent {
  scoreForm: FormGroup;
  minDate: Date;
  maxDate: Date;

  constructor(
    private fb: FormBuilder,
    private scoreService: ScoreService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ScoreDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Score | null
  ) {
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 100, 0, 1);
    this.maxDate = new Date();

    this.scoreForm = this.fb.group({
      employeeId: ['', Validators.required],
      meetingId: ['', Validators.required],
      score: [
        null,
        [Validators.required, Validators.min(0), Validators.max(10)],
      ],
      comment: ['', [Validators.required, Validators.maxLength(500)]],
    });

    if (data) {
      this.scoreForm.patchValue({
        employeeId: data.employee.id,
        meetingId: data.meeting.id,
        score: data.score,
        comment: data.comment,
        meetingDate: data.meeting.meetingDate
          ? new Date(data.meeting.meetingDate)
          : null,
      });
    }
  }

  save(): void {
    if (this.scoreForm.invalid) {
      this.scoreForm.markAllAsTouched();
      return;
    }

    const formValue = this.scoreForm.value;
    const dto: ScoreDto = {
      employeeId: formValue.employeeId,
      meetingId: formValue.meetingId,
      score: formValue.score,
      comment: formValue.comment,
    };

    if (this.data) {
      this.scoreService.updateScore(this.data.id, dto).subscribe({
        next: () => {
          this.snackBar.open('Cập nhật điểm thành công!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.snackBar.open('Lỗi khi cập nhật điểm!', 'Đóng', {
            duration: 3000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          console.error(err);
        },
      });
    } else {
      this.scoreService.createScore(dto).subscribe({
        next: () => {
          this.snackBar.open('Thêm điểm thành công!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.snackBar.open('Lỗi khi thêm điểm!', 'Đóng', {
            duration: 3000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          console.error(err);
        },
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(controlName: string): string {
    const control = this.scoreForm.get(controlName);
    if (control?.hasError('required')) return 'Trường này là bắt buộc';
    if (control?.hasError('maxlength')) return 'Không vượt quá 500 ký tự';
    if (control?.hasError('min') || control?.hasError('max'))
      return 'Điểm phải từ 0 đến 10';
    return '';
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }
}
