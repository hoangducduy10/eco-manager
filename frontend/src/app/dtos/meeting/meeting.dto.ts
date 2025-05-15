import { IsNotEmpty, IsString } from 'class-validator';

export class MeetingDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  description: string;

  meeting_date: string;

  constructor(data: any) {
    this.title = data.title;
    this.description = data.description;
    this.meeting_date = data.meeting_date;
  }
}
