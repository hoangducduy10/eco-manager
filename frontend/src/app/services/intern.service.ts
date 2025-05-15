import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Intern } from '../models/intern';
import { HttpClient, HttpParams } from '@angular/common/http';
import { InternListResponse } from '../reponses/intern/intern-list.response';

@Injectable({
  providedIn: 'root',
})
export class InternService {
  private apiGetInterns = `${environment.apiBaseUrl}/interns`;
  private internSubject = new BehaviorSubject<Intern[]>([]);
  private totalPagesSubject = new BehaviorSubject<number>(0);

  interns$ = this.internSubject.asObservable();
  totalPages$ = this.totalPagesSubject.asObservable();

  private currentSearchParams = {
    fullName: '',
    active: null,
    page: 0,
    size: 5,
  };

  constructor(private http: HttpClient) {}

  getInterns(
    fullName: string,
    active: boolean | null,
    page: number,
    size: number
  ): Observable<InternListResponse> {
    let params = new HttpParams()
      .set('fullName', fullName)
      .set('page', page.toString())
      .set('size', size.toString());

    if (active !== null) {
      params = params.set('active', active.toString());
    }

    return this.http
      .get<InternListResponse>(this.apiGetInterns, { params })
      .pipe(
        tap((response) => {
          this.internSubject.next(response.interns);
          this.totalPagesSubject.next(response.totalPages);
        })
      );
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
    return this.http.put<Intern>(`${this.apiGetInterns}/update/${id}`, intern);
  }

  deleteIntern(id: number) {
    return this.http.delete(`${this.apiGetInterns}/delete/${id}`, {
      responseType: 'text',
    });
  }

  setSearchParams(param: any) {
    this.currentSearchParams = {
      ...this.currentSearchParams,
      ...param,
    };
  }

  refreshCurrentPage() {
    this.getInterns(
      this.currentSearchParams.fullName,
      this.currentSearchParams.active,
      this.currentSearchParams.page,
      this.currentSearchParams.size
    ).subscribe();
  }
}
