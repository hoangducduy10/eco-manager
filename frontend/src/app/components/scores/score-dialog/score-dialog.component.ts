import { Component, Inject, OnInit } from '@angular/core';
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
import { EmployeeService } from '../../../services/employee.service';
import { MeetingService } from '../../../services/meeting.service';
import { Employee } from '../../../models/employee';
import { Meeting } from '../../../models/meeting';

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
export class ScoreDialogComponent implements OnInit {
  scoreForm: FormGroup;
  employees: Employee[] = [];
  meetings: Meeting[] = [];

  constructor(
    private fb: FormBuilder,
    private scoreService: ScoreService,
    private employeeService: EmployeeService,
    private meetingService: MeetingService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ScoreDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Score | null
  ) {
    this.scoreForm = this.fb.group({
      employeeId: [null, Validators.required],
      meetingId: [null, Validators.required],
      score: [
        null,
        [Validators.required, Validators.min(0), Validators.max(10)],
      ],
      comment: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadMeetings();
  }

  private loadEmployees(): void {
    this.employeeService
      .getEmployees('', null, null, 0, 1000)
      .subscribe((response) => {
        this.employees = response.items;
        this.patchFormIfEdit();
      });
  }

  private loadMeetings(): void {
    this.meetingService.getMeetings('', '', 0, 1000).subscribe((response) => {
      this.meetings = response.items;
      this.patchFormIfEdit();
    });
  }

  private patchFormIfEdit(): void {
    if (this.data && this.employees.length > 0 && this.meetings.length > 0) {
      this.scoreForm.patchValue({
        employeeId: this.data.employee?.id || null,
        meetingId: this.data.meeting?.id || null,
        score: this.data.score,
        comment: this.data.comment || '',
      });
    }
  }

  save(): void {
    if (this.scoreForm.invalid) {
      this.scoreForm.markAllAsTouched();
      return;
    }

    const formValue = this.scoreForm.value;

    if (!formValue.employeeId) {
      this.snackBar.open('Vui lòng chọn nhân viên!', 'Đóng', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
      return;
    }

    const dto = new ScoreDto(formValue);

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
          console.error('Update error:', err);
          this.snackBar.open('Lỗi khi cập nhật điểm!', 'Đóng', {
            duration: 3000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
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
          console.error('Create error:', err);
          this.snackBar.open('Lỗi khi thêm điểm!', 'Đóng', {
            duration: 3000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
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
}
