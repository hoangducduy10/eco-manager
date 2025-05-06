import { Component } from '@angular/core';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [PaginationComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent {
  currentPage: number = 0;
  itemsPerPage: number = 5;
  totalPages: number = 0;
}
