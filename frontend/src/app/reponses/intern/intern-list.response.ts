import { Intern } from '../../models/intern';

export interface InternListResponse {
  interns: Intern[];
  totalPages: number;
}
