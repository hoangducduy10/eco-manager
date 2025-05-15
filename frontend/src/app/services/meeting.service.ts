import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MeetingListResponse } from '../reponses/meeting/meeting-list.response';
import { MeetingDto } from '../dtos/meeting/meeting.dto';
import { Meeting } from '../models/meeting';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  private apiGetMeetings = `${environment.apiBaseUrl}/meetings`;
  private meetingsSubject = new BehaviorSubject<Meeting[]>([]);
  private totalPagesSubject = new BehaviorSubject<number>(0);

  meetings$ = this.meetingsSubject.asObservable();
  totalPages$ = this.totalPagesSubject.asObservable();

  private currentSearchParams = {
    title: '',
    meetingDate: '',
    page: 0,
    size: 5,
  };

  constructor(private http: HttpClient) {}

  getMeetings(
    title: string,
    meetingDate: string,
    page: number,
    size: number
  ): Observable<MeetingListResponse> {
    let params = new HttpParams()
      .set('title', title)
      .set('meetingDate', meetingDate)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<MeetingListResponse>(this.apiGetMeetings, { params })
      .pipe(
        tap((response) => {
          this.meetingsSubject.next(response.meetings);
          this.totalPagesSubject.next(response.totalPages);
        })
      );
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

  setSearchParams(params: any) {
    this.currentSearchParams = { ...this.currentSearchParams, ...params };
  }

  refreshCurrentPage() {
    this.getMeetings(
      this.currentSearchParams.title,
      this.currentSearchParams.meetingDate,
      this.currentSearchParams.page,
      this.currentSearchParams.size
    ).subscribe();
  }
}
