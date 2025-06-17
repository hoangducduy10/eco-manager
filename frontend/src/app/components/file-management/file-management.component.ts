import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../../services/file.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { FileMetadata } from '../../models/file-metadata';

interface FileInfo extends FileMetadata {
  selected?: boolean;
  type: string;
}

@Component({
  selector: 'app-file-management',
  templateUrl: './file-management.component.html',
  styleUrls: ['./file-management.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule],
})
export class FileManagementComponent implements OnInit {
  fileName: string = '';
  currentPage: number = 0;
  itemsPerPage: number = 5;
  selectAll: boolean = false;
  fileTypeFilter: string = 'all';
  files: FileInfo[] = [];

  get files$() {
    return this.fileService.files$;
  }

  get totalPages$() {
    return this.fileService.totalPages$;
  }

  constructor(
    private fileService: FileService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.search();
    this.files$.subscribe((files) => {
      this.files = files.map((file) => {
        const newFile = {
          ...file,
          selected: false,
          type: this.getFileType(file.file_name),
        };
        return newFile;
      });
    });
  }

  search(resetPage: boolean = false) {
    if (resetPage) {
      this.currentPage = 0;
    }

    this.fileService.setSearchParams({
      fileName: this.fileName,
      page: this.currentPage,
      size: this.itemsPerPage,
    });
  }

  private getFileType(fileName: string): string {
    if (!fileName) {
      return 'other';
    }
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'doc':
      case 'docx':
        return 'doc';
      case 'pdf':
        return 'pdf';
      default:
        return 'other';
    }
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.files = this.files.map((file: FileInfo) => ({
      ...file,
      selected: this.selectAll,
    }));
  }

  toggleFileSelection(file: FileInfo): void {
    file.selected = !file.selected;
    this.selectAll = this.files.every((f: FileInfo) => f.selected);
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
      this.fileService.convertToPdf(file.id).subscribe({
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
      this.fileService.downloadFile(file.id).subscribe({
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
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      this.fileService.uploadFile(file).subscribe({
        next: () => {
          this.snackBar.open('Tải lên thành công', 'Đóng', { duration: 3000 });
          this.search(true);
          input.value = '';
        },
        error: () => {
          this.snackBar.open('Tải lên thất bại', 'Đóng', { duration: 3000 });
          input.value = '';
        },
      });
    }
  }

  downloadFile(fileId: number, fileName: string): void {
    this.fileService.downloadFile(fileId).subscribe({
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

  convertToPdf(fileId: number): void {
    this.fileService.convertToPdf(fileId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'converted_file.pdf';
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

  convertSelectedToPdf(file?: FileInfo): void {
    const filesToConvert = file
      ? [file]
      : this.files.filter((f) => f.selected && f.type === 'doc');

    if (filesToConvert.length === 0) {
      this.snackBar.open(
        'Vui lòng chọn ít nhất một file DOC để chuyển đổi',
        'Đóng',
        {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        }
      );
      return;
    }

    filesToConvert.forEach((fileToConvert) => {
      this.fileService.convertAndSavePdf(fileToConvert.id).subscribe({
        next: () => {
          this.snackBar.open(
            `Đã chuyển ${fileToConvert.file_name} sang PDF thành công`,
            'Đóng',
            {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            }
          );
        },
        error: (error) => {
          this.snackBar.open(
            `Lỗi khi chuyển ${fileToConvert.file_name} sang PDF: ${error.message}`,
            'Đóng',
            {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            }
          );
        },
      });
    });
  }

  deleteFile(fileId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: 'Bạn có chắc muốn xóa file này?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fileService.deleteFile(fileId).subscribe({
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
}
