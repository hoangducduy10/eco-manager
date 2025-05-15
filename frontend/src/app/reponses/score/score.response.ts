export interface ScoreResponse {
  id: number;
  employeeId: number;
  meetingId: number;
  employeeName: string;
  meetingName: string;
  meetingDate: string;
  score: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}
