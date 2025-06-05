import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../environments/environment';

export interface FileInfo {
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  selected?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private apiUrl = `${environment.apiBaseUrl}/files`;
  private filesSubject = new BehaviorSubject<FileInfo[]>([]);
  public files$ = this.filesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFiles();
  }

  private loadFiles(): void {
    this.http
      .get<string[]>(this.apiUrl)
      .pipe(
        map((files) =>
          files.map((file) => ({
            name: file,
            type: this.getFileType(file),
            size: 0,
            uploadDate: new Date(),
          }))
        ),
        tap((files) => this.filesSubject.next(files)),
        catchError((error) => {
          console.error('Error loading files:', error);
          return of([]);
        })
      )
      .subscribe();
  }

  private getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'doc':
      case 'docx':
        return 'doc';
      case 'pdf':
        return 'pdf';
      default:
        return 'other';
    }
  }

  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<string>(`${this.apiUrl}/upload`, formData).pipe(
      tap(() => this.loadFiles()),
      catchError((error) => {
        console.error('Error uploading file:', error);
        throw error;
      })
    );
  }

  uploadMultipleFiles(files: File[]): Observable<string> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    return this.http
      .post<string>(`${this.apiUrl}/upload/multiple`, formData)
      .pipe(
        tap(() => this.loadFiles()),
        catchError((error) => {
          console.error('Error uploading multiple files:', error);
          throw error;
        })
      );
  }

  downloadFile(fileName: string): Observable<Blob> {
    return this.http
      .get(`${this.apiUrl}/${fileName}`, {
        responseType: 'blob',
        headers: new HttpHeaders().set('Accept', '*/*'),
      })
      .pipe(
        catchError((error) => {
          console.error('Error downloading file:', error);
          throw error;
        })
      );
  }

  convertToPdf(fileName: string): Observable<Blob> {
    return this.http
      .post<Blob>(
        `${this.apiUrl}/convert-to-pdf/${fileName}`,
        {},
        {
          responseType: 'blob' as 'json',
          headers: new HttpHeaders().set('Accept', 'application/pdf'),
        }
      )
      .pipe(
        catchError((error) => {
          console.error('Error converting file to PDF:', error);
          throw error;
        })
      );
  }

  convertAndSavePdf(fileName: string): Observable<string> {
    return this.http
      .post<string>(`${this.apiUrl}/convert-and-save/${fileName}`, {})
      .pipe(
        tap(() => this.loadFiles()),
        catchError((error) => {
          console.error('Error converting and saving PDF:', error);
          throw error;
        })
      );
  }

  deleteFile(fileName: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${fileName}`).pipe(
      tap(() => this.loadFiles()),
      catchError((error) => {
        console.error('Error deleting file:', error);
        throw error;
      })
    );
  }

  getFiles(): Observable<FileInfo[]> {
    return this.files$;
  }
}
