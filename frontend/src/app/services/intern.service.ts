import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import {
  BehaviorSubject,
  debounceTime,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import { Intern } from '../models/intern';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ListResponse } from '../reponses/list-response';

interface SearchParams {
  fullName: string;
  active: boolean | null;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class InternService {
  private apiGetInterns = `${environment.apiBaseUrl}/interns`;

  private searchParamsSubject = new BehaviorSubject<SearchParams>({
    fullName: '',
    active: null,
    page: 0,
    size: 5,
  });

  private internSubject = new BehaviorSubject<Intern[]>([]);
  private totalPagesSubject = new BehaviorSubject<number>(0);

  interns$ = this.internSubject.asObservable();
  totalPages$ = this.totalPagesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.searchParamsSubject
      .asObservable()
      .pipe(
        debounceTime(300),
        switchMap((params) =>
          this.getInterns(
            params.fullName,
            params.active,
            params.page,
            params.size
          )
        ),
        tap((response) => {
          this.internSubject.next(response.items);
          this.totalPagesSubject.next(response.totalPages);
        })
      )
      .subscribe();
  }

  getInterns(
    fullName: string,
    active: boolean | null,
    page: number,
    size: number
  ): Observable<ListResponse<Intern>> {
    let params = new HttpParams()
      .set('fullName', fullName)
      .set('page', page.toString())
      .set('size', size.toString());

    if (active !== null) {
      params = params.set('active', active.toString());
    }

    return this.http.get<ListResponse<Intern>>(this.apiGetInterns, { params });
  }

  getInternById(id: number): Observable<Intern> {
    return this.http.get<Intern>(`${this.apiGetInterns}/${id}`);
  }

  createIntern(intern: Intern): Observable<Intern> {
    return this.http
      .post<Intern>(`${this.apiGetInterns}/create`, intern)
      .pipe(tap(() => this.refreshCurrentPage()));
  }

  updateIntern(id: number, intern: Intern): Observable<Intern> {
    return this.http
      .put<Intern>(`${this.apiGetInterns}/update/${id}`, intern)
      .pipe(tap(() => this.refreshCurrentPage()));
  }

  deleteIntern(id: number) {
    return this.http
      .delete(`${this.apiGetInterns}/delete/${id}`)
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
