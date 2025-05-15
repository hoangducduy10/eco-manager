import { Meeting } from '../../models/meeting';

export interface MeetingListResponse {
  meetings: Meeting[];
  totalPages: number;
}
