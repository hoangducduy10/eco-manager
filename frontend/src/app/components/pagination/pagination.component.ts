import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent {
  @Input() currentPage: number = 0;
  @Input() totalPages: number = 0;
  @Output() pageChange = new EventEmitter<number | string>();

  visiblePages: (number | string)[] = [];

  ngOnChanges(): void {
    this.visiblePages = this.generateVisiblePageArray(
      this.currentPage,
      this.totalPages
    );
  }

  onPageChange(page: number | string) {
    this.pageChange.emit(page);
  }

  generateVisiblePageArray(
    currentPage: number,
    totalPages: number
  ): (number | string)[] {
    const pages: (number | string)[] = [];

    // Nếu totalPages <= 1, không cần phân trang
    if (totalPages <= 1) {
      return totalPages === 1 ? [1] : [];
    }

    // Chuyển currentPage sang hệ chỉ số bắt đầu từ 1 (trang hiển thị)
    const displayPage = currentPage + 1;

    // Luôn hiển thị trang 1
    pages.push(1);

    let startPage: number;
    let endPage: number;

    // Nếu totalPages <= 3, hiển thị tất cả các trang
    if (totalPages <= 3) {
      startPage = 2;
      endPage = totalPages;
    } else if (displayPage <= 2) {
      // Ở gần trang đầu: hiển thị 1, 2, 3
      startPage = 2;
      endPage = 3;
    } else if (displayPage >= totalPages - 1) {
      // Ở gần trang cuối: hiển thị 3 trang cuối
      startPage = totalPages - 2;
      endPage = totalPages - 1;
    } else {
      // Ở giữa: hiển thị 1 trang trước và 1 trang sau
      startPage = displayPage - 1;
      endPage = displayPage + 1;
    }

    // Đảm bảo startPage và endPage không vượt quá giới hạn
    startPage = Math.max(2, startPage);
    endPage = Math.min(totalPages - 1, endPage);

    // Nếu startPage > 2, thêm dấu "..." trước
    if (startPage > 2) {
      pages.push('...');
    }

    // Hiển thị các trang từ startPage đến endPage
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Nếu endPage < totalPages - 1, thêm dấu "..." sau
    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    // Luôn hiển thị trang cuối nếu totalPages > 1
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }
}
