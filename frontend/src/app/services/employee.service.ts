import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import {
  BehaviorSubject,
  debounceTime,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import { Employee } from '../models/employee';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ListResponse } from '../reponses/list-response';
import { EmployeeRole } from '../models/employee-role.enum';

interface SearchParams {
  fullName: string;
  role: EmployeeRole | null;
  active: boolean | null;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private apiGetEmployees = `${environment.apiBaseUrl}/employees`;

  private searchParamsSubject = new BehaviorSubject<SearchParams>({
    fullName: '',
    role: null,
    active: null,
    page: 0,
    size: 5,
  });

  private employeeSubject = new BehaviorSubject<Employee[]>([]);
  private totalPagesSubject = new BehaviorSubject<number>(0);

  employees$ = this.employeeSubject.asObservable();
  totalPages$ = this.totalPagesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.searchParamsSubject
      .asObservable()
      .pipe(
        debounceTime(300),
        switchMap((params) =>
          this.getEmployees(
            params.fullName,
            params.role,
            params.active,
            params.page,
            params.size
          )
        ),
        tap((response) => {
          this.employeeSubject.next(response.items);
          this.totalPagesSubject.next(response.totalPages);
        })
      )
      .subscribe();
  }

  getEmployees(
    fullName: string,
    role: EmployeeRole | null,
    active: boolean | null,
    page: number,
    size: number
  ): Observable<ListResponse<Employee>> {
    let params = new HttpParams()
      .set('fullName', fullName)
      .set('role', role ? role : '')
      .set('page', page.toString())
      .set('size', size.toString());

    if (active !== null) {
      params = params.set('active', active.toString());
    }

    return this.http.get<ListResponse<Employee>>(this.apiGetEmployees, {
      params,
    });
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiGetEmployees}/${id}`);
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http
      .post<Employee>(`${this.apiGetEmployees}/create`, employee)
      .pipe(tap(() => this.refreshCurrentPage()));
  }

  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http
      .put<Employee>(`${this.apiGetEmployees}/update/${id}`, employee)
      .pipe(tap(() => this.refreshCurrentPage()));
  }

  deleteEmployee(id: number) {
    return this.http
      .delete(`${this.apiGetEmployees}/delete/${id}`)
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
