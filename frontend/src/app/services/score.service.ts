import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { ScoreListResponse } from '../reponses/score/score-list.response';
import { Observable } from 'rxjs';
import { ScoreDto } from '../dtos/score/score.dto';
import { Score } from '../models/score';

@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  private apiGetScores = `${environment.apiBaseUrl}/scores`;

  constructor(private http: HttpClient) {}

  getScores(
    employeeName: string,
    meetingName: string,
    meetingDate: string,
    page: number,
    size: number
  ): Observable<ScoreListResponse> {
    let params = new HttpParams()
      .set('employeeName', employeeName)
      .set('meetingName', meetingName)
      .set('meetingDate', meetingDate)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ScoreListResponse>(this.apiGetScores, { params });
  }

  getScoreById(id: number): Observable<Score> {
    return this.http.get<Score>(`${this.apiGetScores}/${id}`);
  }

  createScore(score: ScoreDto): Observable<Score> {
    return this.http.post<Score>(`${this.apiGetScores}/create`, score);
  }

  updateScore(id: number, score: ScoreDto): Observable<Score> {
    return this.http.put<Score>(`${this.apiGetScores}/update/${id}`, score);
  }

  deleteScore(id: number) {
    return this.http.delete(`${this.apiGetScores}/delete/${id}`);
  }
}
