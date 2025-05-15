export interface Score {
  id: number;
  employee: {
    id: number;
    fullName: string;
  };
  meeting: {
    id: number;
    title: string;
    meetingDate: string;
  };
  score: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}
