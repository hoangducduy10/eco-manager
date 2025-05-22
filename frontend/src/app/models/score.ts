import { ScoreResponse } from '../reponses/score/score.response';

export interface Score extends ScoreResponse {
  employee: {
    id: number;
    fullName: string;
  };
  meeting: {
    id: number;
    title: string;
    meetingDate: string;
  };
}
