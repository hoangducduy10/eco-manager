import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  Observable,
  switchMap,
  tap,
  catchError,
  map,
} from 'rxjs';
import { ScoreDto } from '../dtos/score/score.dto';
import { Score } from '../models/score';
import { ListResponse } from '../reponses/list-response';
import { ScoreResponse } from '../reponses/score/score.response';

interface SearchParams {
  employeeName: string;
  meetingName: string;
  meetingDate: string;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  private apiGetScores = `${environment.apiBaseUrl}/scores`;

  private searchParamsSubject = new BehaviorSubject<SearchParams>({
    employeeName: '',
    meetingName: '',
    meetingDate: '',
    page: 0,
    size: 5,
  });

  private scoresSubject = new BehaviorSubject<Score[]>([]);
  private totalPagesSubject = new BehaviorSubject<number>(0);

  scores$ = this.scoresSubject.asObservable();
  totalPages$ = this.totalPagesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.searchParamsSubject
      .asObservable()
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        switchMap((params) =>
          this.getScores(
            params.employeeName,
            params.meetingName,
            params.meetingDate,
            params.page,
            params.size
          )
        ),
        tap((response) => {
          if (response && response.items) {
            this.scoresSubject.next(response.items);
            this.totalPagesSubject.next(response.totalPages);
          }
        }),
        catchError((error) => {
          console.error('Lỗi khi lấy dữ liệu:', error);
          this.scoresSubject.next([]);
          this.totalPagesSubject.next(0);
          throw error;
        })
      )
      .subscribe();
  }

  getScores(
    employeeName: string,
    meetingName: string,
    meetingDate: string,
    page: number,
    size: number
  ): Observable<ListResponse<Score>> {
    let params = new HttpParams()
      .set('employeeName', employeeName)
      .set('meetingName', meetingName)
      .set('meetingDate', meetingDate)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<ListResponse<ScoreResponse>>(this.apiGetScores, { params })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map((item) => ({
            ...item,
            employee: {
              id: item.employeeId,
              fullName: item.employeeName,
            },
            meeting: {
              id: item.meetingId,
              title: item.meetingName,
              meetingDate: item.meetingDate,
            },
          })) as Score[],
        })),
        tap((response) => {
          if (response && response.items) {
            this.scoresSubject.next(response.items);
            this.totalPagesSubject.next(response.totalPages);
          }
        }),
        catchError((error) => {
          throw error;
        })
      );
  }

  getScoreById(id: number): Observable<Score> {
    return this.http.get<Score>(`${this.apiGetScores}/${id}`);
  }

  createScore(score: ScoreDto): Observable<Score> {
    return this.http
      .post<Score>(`${this.apiGetScores}/create`, score)
      .pipe(tap(() => this.refreshCurrentPage()));
  }

  // Trong ScoreService, thêm debug cho updateScore method
  updateScore(id: number, score: any): Observable<Score> {
    console.log('Service updateScore - ID:', id);
    console.log('Service updateScore - Data:', score);
    console.log('Service updateScore - JSON:', JSON.stringify(score));

    return this.http
      .put<Score>(`${this.apiGetScores}/update/${id}`, score)
      .pipe(
        tap((response) => {
          console.log('Update response:', response);
          this.refreshCurrentPage();
        }),
        catchError((error) => {
          console.error('Update service error:', error);
          throw error;
        })
      );
  }

  deleteScore(id: number) {
    return this.http
      .delete(`${this.apiGetScores}/delete/${id}`)
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
