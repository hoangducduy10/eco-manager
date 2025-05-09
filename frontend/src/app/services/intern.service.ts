import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { Intern } from '../models/intern';
import { HttpClient, HttpParams } from '@angular/common/http';
import { InternListResponse } from '../reponses/intern/intern-list.response';

@Injectable({
  providedIn: 'root',
})
export class InternService {
  private apiGetInterns = `${environment.apiBaseUrl}/interns`;

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

    return this.http.get<InternListResponse>(this.apiGetInterns, { params });
  }

  createIntern(intern: Intern): Observable<Intern> {
    return this.http.post<Intern>(`${this.apiGetInterns}/create`, intern);
  }

  updateIntern(id: number, intern: Intern): Observable<Intern> {
    return this.http.put<Intern>(`${this.apiGetInterns}/update/${id}`, intern);
  }

  getInternById(id: number): Observable<Intern> {
    return this.http.get<Intern>(`${this.apiGetInterns}/${id}`);
  }

  deleteIntern(id: number) {
    return this.http.delete(`${this.apiGetInterns}/delete/${id}`, {
      responseType: 'text',
    });
  }
}
