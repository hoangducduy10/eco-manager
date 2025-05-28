import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { MeetingDto } from '../dtos/meeting/meeting.dto';
import { Meeting } from '../models/meeting';
import { ListResponse } from '../reponses/list-response';

interface SearchParams {
  title: string;
  meetingDate: string;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  private apiGetMeetings = `${environment.apiBaseUrl}/meetings`;

  private searchParamsSubject = new BehaviorSubject<SearchParams>({
    title: '',
    meetingDate: '',
    page: 0,
    size: 5,
  });

  private meetingsSubject = new BehaviorSubject<Meeting[]>([]);
  private totalPagesSubject = new BehaviorSubject<number>(0);

  meetings$ = this.meetingsSubject.asObservable();
  totalPages$ = this.totalPagesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.searchParamsSubject
      .asObservable()
      .pipe(
        debounceTime(300),
        switchMap((params) =>
          this.getMeetings(
            params.title,
            params.meetingDate,
            params.page,
            params.size
          )
        ),
        tap((response) => {
          this.meetingsSubject.next(response.items);
          this.totalPagesSubject.next(response.totalPages);
        })
      )
      .subscribe();
  }

  getMeetings(
    title: string,
    meetingDate: string,
    page: number,
    size: number
  ): Observable<ListResponse<Meeting>> {
    let params = new HttpParams()
      .set('title', title)
      .set('meetingDate', meetingDate)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ListResponse<Meeting>>(this.apiGetMeetings, {
      params,
    });
  }

  getMeetingById(id: number): Observable<Meeting> {
    return this.http.get<Meeting>(`${this.apiGetMeetings}/${id}`);
  }

  createMeeting(meeting: MeetingDto): Observable<Meeting> {
    return this.http
      .post<Meeting>(`${this.apiGetMeetings}/create`, meeting)
      .pipe(tap(() => this.refreshCurrentPage()));
  }

  updateMeeting(id: number, meeting: MeetingDto): Observable<Meeting> {
    const payload = {
      ...meeting,
      meeting_date: meeting.meeting_date,
    };

    return this.http
      .put<Meeting>(`${this.apiGetMeetings}/update/${id}`, payload)
      .pipe(tap(() => this.refreshCurrentPage()));
  }

  deleteMeeting(id: number) {
    return this.http
      .delete(`${this.apiGetMeetings}/delete/${id}`)
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
