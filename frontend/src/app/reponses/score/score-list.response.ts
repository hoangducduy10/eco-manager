export interface ScoreListResponse {
  scores: {
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
  }[];
  totalPages: number;
}
