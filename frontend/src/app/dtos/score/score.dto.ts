import { IsNotEmpty, IsNumber } from 'class-validator';

export class ScoreDto {
  employeeId: number;

  meetingId: number;

  @IsNotEmpty()
  @IsNumber()
  score: number;

  comment?: string;

  constructor(data: any) {
    this.employeeId = data.employeeId;
    this.meetingId = data.meetingId;
    this.score = data.score;
    this.comment = data.comment;
  }
}
