import { IsString, IsNotEmpty, IsPhoneNumber, IsDate } from 'class-validator';

export class LoginDTO {
  @IsPhoneNumber()
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  constructor(data: any) {
    this.phone_number = data.phone_number;
    this.password = data.password;
  }
}
