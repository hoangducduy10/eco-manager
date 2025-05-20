import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateUtilsService {
  fromApiFormat(dateStr: string): Date | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  }

  toApiFormat(date: Date): string {
    if (!date) return '';
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  }

  fromDisplayFormat(dateStr: string): Date | null {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
}
