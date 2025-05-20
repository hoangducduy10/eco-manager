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
} from 'rxjs';
import { ScoreDto } from '../dtos/score/score.dto';
import { Score } from '../models/score';
import { ListResponse } from '../reponses/list-response';

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
          this.scoresSubject.next(response.items);
          this.totalPagesSubject.next(response.totalPages);
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

    return this.http.get<ListResponse<Score>>(this.apiGetScores, { params });
  }

  getScoreById(id: number): Observable<Score> {
    return this.http.get<Score>(`${this.apiGetScores}/${id}`);
  }

  createScore(score: ScoreDto): Observable<Score> {
    return this.http
      .post<Score>(`${this.apiGetScores}/create`, score)
      .pipe(tap(() => this.refreshCurrentPage()));
  }

  updateScore(id: number, score: ScoreDto): Observable<Score> {
    return this.http
      .put<Score>(`${this.apiGetScores}/update/${id}`, score)
      .pipe(tap(() => this.refreshCurrentPage()));
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
