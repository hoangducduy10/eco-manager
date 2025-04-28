import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Intern } from '../../../models/intern';
import { InternService } from '../../../services/intern.service';

@Component({
  selector: 'app-intern-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
  ],
  templateUrl: './intern-dialog.component.html',
  styleUrl: './intern-dialog.component.scss',
})
export class InternDialogComponent {
  intern: Intern = {
    id: 0,
    full_name: '',
    email: '',
    phone_number: '',
    start_date: '',
    status: 'Active',
  };

  constructor(
    public dialogRef: MatDialogRef<InternDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Intern | null,
    private internService: InternService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.intern = { ...this.data }; // Sao chép dữ liệu để tránh thay đổi dữ liệu gốc
    }
  }

  save(): void {
    if (this.intern.id === 0) {
      // Tạo intern mới (POST request)
      this.internService.createIntern(this.intern).subscribe({
        next: () => {
          this.snackBar.open('Thêm intern thành công!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open('Lỗi khi thêm intern.', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
          console.error(error);
        },
      });
    } else {
      // Cập nhật intern hiện có (PUT request)
      this.internService.updateIntern(this.intern.id, this.intern).subscribe({
        next: () => {
          this.snackBar.open('Cập nhật intern thành công!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open('Lỗi khi cập nhật intern.', 'Đóng', {
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

  cancel(): void {
    this.dialogRef.close();
  }
}
