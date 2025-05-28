import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  map,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import { Assignment } from '../models/assignment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ListResponse } from '../reponses/list-response';
import { AssignmentResponse } from '../reponses/assignment/assignment.response';
import { AssignmentDto } from '../dtos/assignment/assignment.dto';

interface SearchParams {
  productName: string;
  employeeName: string;
  assignedDate: string;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  private apiGetAssignments = `${environment.apiBaseUrl}/assignments`;

  private searchParamsSubject = new BehaviorSubject<SearchParams>({
    productName: '',
    employeeName: '',
    assignedDate: '',
    page: 0,
    size: 5,
  });

  private assignmentsSubject = new BehaviorSubject<Assignment[]>([]);
  private totalPagesSubject = new BehaviorSubject<number>(0);

  assignments$ = this.assignmentsSubject.asObservable();
  totalPages$ = this.totalPagesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.searchParamsSubject
      .asObservable()
      .pipe(
        debounceTime(300),
        switchMap((params) =>
          this.getAssignments(
            params.productName,
            params.employeeName,
            params.assignedDate,
            params.page,
            params.size
          )
        ),
        tap((response) => {
          if (response && response.items) {
            this.assignmentsSubject.next(response.items);
            this.totalPagesSubject.next(response.totalPages);
          }
        }),
        catchError((error) => {
          console.error('Lỗi khi lấy dữ liệu:', error);
          this.assignmentsSubject.next([]);
          this.totalPagesSubject.next(0);
          throw error;
        })
      )
      .subscribe();
  }

  getAssignments(
    productName: string,
    employeeName: string,
    assignedDate: string,
    page: number,
    size: number
  ): Observable<ListResponse<Assignment>> {
    let params = new HttpParams()
      .set('productName', productName)
      .set('employeeName', employeeName)
      .set('assignedDate', assignedDate)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<ListResponse<AssignmentResponse>>(this.apiGetAssignments, { params })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map((item) => ({
            ...item,
            product: {
              id: item.productId,
              name: item.productName,
            },
            employee: {
              id: item.employeeId,
              fullName: item.employeeName,
            },
          })) as Assignment[],
        })),
        tap((response) => {
          if (response && response.items) {
            this.assignmentsSubject.next(response.items);
            this.totalPagesSubject.next(response.totalPages);
          }
        }),
        catchError((error) => {
          throw error;
        })
      );
  }

  getAssignmentById(id: number): Observable<Assignment> {
    return this.http.get<Assignment>(`${this.apiGetAssignments}/${id}`);
  }

  createAssignment(assignment: AssignmentDto): Observable<Assignment> {
    return this.http
      .post<Assignment>(`${this.apiGetAssignments}/create`, assignment)
      .pipe(tap(() => this.refreshCurrentPage()));
  }

  updateAssignment(
    id: number,
    assignment: AssignmentDto
  ): Observable<Assignment> {
    return this.http
      .put<Assignment>(`${this.apiGetAssignments}/update/${id}`, assignment)
      .pipe(tap(() => this.refreshCurrentPage()));
  }

  deleteAssignment(id: number) {
    return this.http
      .delete(`${this.apiGetAssignments}/delete/${id}`)
      .pipe(tap(() => this.refreshCurrentPage()));
  }

  setSearchParams(params: Partial<SearchParams>) {
    const current = this.searchParamsSubject.value;
    this.searchParamsSubject.next({ ...current, ...params });
  }

  refreshCurrentPage() {
    const current = this.searchParamsSubject.value;
    this.searchParamsSubject.next({ ...current });
  }
}
