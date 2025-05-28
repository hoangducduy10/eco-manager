import { AssignmentResponse } from '../reponses/assignment/assignment.response';

export interface Assignment extends AssignmentResponse {
  product: {
    id: number;
    name: string;
  };
  employee: {
    id: number;
    fullName: string;
  };
}
