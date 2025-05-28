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

  toApiFormat(date: Date | null | undefined): string | null {
    if (!date) return null;

    // Ensure we have a valid Date object
    const validDate = date instanceof Date ? date : new Date(date);

    if (isNaN(validDate.getTime())) {
      return null;
    }

    // Create date in local timezone and format as YYYY-MM-DD
    const year = validDate.getFullYear();
    const month = String(validDate.getMonth() + 1).padStart(2, '0');
    const day = String(validDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  fromDisplayFormat(dateStr: string): Date | null {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
}
