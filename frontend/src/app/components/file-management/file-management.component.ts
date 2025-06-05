import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileSizePipe } from './file-size.pipe';
import { FileService, FileInfo } from '../../services/file.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-file-management',
  templateUrl: './file-management.component.html',
  styleUrls: ['./file-management.component.scss'],
  standalone: true,
  imports: [CommonModule, FileSizePipe, FormsModule, MatTooltipModule],
})
export class FileManagementComponent implements OnInit, OnDestroy {
  files: FileInfo[] = [];
  selectAll: boolean = false;
  private subscription: Subscription = new Subscription();
  searchTerm: string = '';
  fileTypeFilter: string = 'all';
  sortBy: string = '';

  constructor(
    private fileService: FileService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.fileService.files$.subscribe((files) => {
        this.files = files.map((file) => ({
          ...file,
          selected: false,
        }));
      })
    );
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.files = this.files.map((file) => ({
      ...file,
      selected: this.selectAll,
    }));
  }

  toggleFileSelection(file: FileInfo): void {
    file.selected = !file.selected;
    this.selectAll = this.files.every((f) => f.selected);
  }

  getFileIcon(type: string): string {
    switch (type) {
      case 'doc':
        return 'fa-file-word';
      case 'pdf':
        return 'fa-file-pdf';
      default:
        return 'fa-file';
    }
  }

  previewFile(file: FileInfo): void {
    if (file.type === 'doc') {
      this.fileService.convertToPdf(file.name).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        },
        error: (error) => {
          this.snackBar.open('Lỗi khi xem trước: ' + error.message, 'Đóng', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
      });
    } else {
      this.fileService.downloadFile(file.name).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        },
        error: (error) => {
          this.snackBar.open('Lỗi khi xem trước: ' + error.message, 'Đóng', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.fileService.uploadFile(file).subscribe({
        next: () => {
          this.snackBar.open('Tải lên thành công', 'Đóng', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open('Lỗi khi tải lên: ' + error.message, 'Đóng', {
            duration: 5000,
          });
        },
      });
    }
  }

  downloadFile(fileName: string): void {
    this.fileService.downloadFile(fileName).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.snackBar.open('Lỗi khi tải xuống: ' + error.message, 'Đóng', {
          duration: 5000,
        });
      },
    });
  }

  convertToPdf(fileName: string): void {
    this.fileService.convertToPdf(fileName).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName.replace('.docx', '.pdf');
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.snackBar.open('Lỗi khi chuyển đổi: ' + error.message, 'Đóng', {
          duration: 5000,
        });
      },
    });
  }

  convertSelectedToPdf(): void {
    const selectedFiles = this.files.filter(
      (f) => f.selected && f.type === 'doc'
    );
    if (selectedFiles.length === 0) {
      this.snackBar.open(
        'Vui lòng chọn ít nhất một file để chuyển đổi',
        'Đóng',
        {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        }
      );
      return;
    }
    selectedFiles.forEach((file) => {
      this.convertToPdf(file.name);
    });
  }

  deleteFile(fileName: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: 'Bạn có chắc muốn xóa file này?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fileService.deleteFile(fileName).subscribe({
          next: () => {
            this.snackBar.open('Xóa file thành công', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
          },
          error: (error) => {
            console.error('Error deleting employee:', error);
            this.snackBar.open('Xóa file thất bại', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            });
            console.error('Lỗi khi xóa file:', error);
          },
        });
      }
    });
  }

  filterFiles(): FileInfo[] {
    let filteredFiles = this.files;

    if (this.searchTerm) {
      filteredFiles = filteredFiles.filter((file) =>
        file.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.fileTypeFilter !== 'all') {
      filteredFiles = filteredFiles.filter(
        (file) => file.type === this.fileTypeFilter
      );
    }

    if (this.sortBy) {
      filteredFiles.sort((a, b) => {
        switch (this.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'date':
            return b.uploadDate.getTime() - a.uploadDate.getTime();
          case 'size':
            return b.size - a.size;
          default:
            return 0;
        }
      });
    }

    return filteredFiles;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
