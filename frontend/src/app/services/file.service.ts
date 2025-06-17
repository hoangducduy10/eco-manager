import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { FileMetadata } from '../models/file-metadata';
import { ListResponse } from '../reponses/list-response';

interface SearchParams {
  fileName: string;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private apiUrl = `${environment.apiBaseUrl}/files`;

  private filesSubject = new BehaviorSubject<FileMetadata[]>([]);
  private totalPagesSubject = new BehaviorSubject<number>(0);

  files$ = this.filesSubject.asObservable();
  totalPages$ = this.totalPagesSubject.asObservable();

  private searchParamsSubject = new BehaviorSubject<SearchParams>({
    fileName: '',
    page: 0,
    size: 5,
  });

  constructor(private http: HttpClient) {
    this.searchParamsSubject.asObservable().subscribe(() => {
      this.reloadFiles();
    });
  }

  loadFiles(
    fileName: string,
    page: number,
    size: number
  ): Observable<ListResponse<FileMetadata>> {
    let params = new HttpParams()
      .set('fileName', fileName)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ListResponse<FileMetadata>>(this.apiUrl, {
      params,
    });
  }

  private reloadFiles(): void {
    const { fileName, page, size } = this.searchParamsSubject.value;
    this.loadFiles(fileName, page, size).subscribe({
      next: (res) => {
        this.filesSubject.next(res.items);
        this.totalPagesSubject.next(res.totalPages);
      },
      error: (err) => {
        console.error('Failed to load files:', err);
      },
    });
  }

  getFileType(fileName: string): string {
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
      tap(() => this.refreshCurrentPage()),
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
        tap(() => this.refreshCurrentPage()),
        catchError((error) => {
          console.error('Error uploading multiple files:', error);
          throw error;
        })
      );
  }

  downloadFile(fileId: number): Observable<Blob> {
    return this.http
      .get(`${this.apiUrl}/${fileId}`, {
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

  convertToPdf(fileId: number): Observable<Blob> {
    return this.http
      .post<Blob>(
        `${this.apiUrl}/convert-to-pdf/${fileId}`,
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

  convertAndSavePdf(fileId: number): Observable<string> {
    return this.http
      .post<string>(`${this.apiUrl}/convert-and-save/${fileId}`, {})
      .pipe(
        tap(() => this.refreshCurrentPage()),
        catchError((error) => {
          console.error('Error converting and saving PDF:', error);
          throw error;
        })
      );
  }

  deleteFile(fileId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${fileId}`).pipe(
      tap(() => this.refreshCurrentPage()),
      catchError((error) => {
        console.error('Error deleting file:', error);
        throw error;
      })
    );
  }

  getFiles(): Observable<FileMetadata[]> {
    return this.files$;
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
