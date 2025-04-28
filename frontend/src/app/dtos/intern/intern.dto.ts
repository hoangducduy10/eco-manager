import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class InternDTO {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsPhoneNumber()
  phone_number: string;

  @IsEmail()
  email: string;

  constructor(data: any) {
    this.full_name = data.full_name || '';
    this.phone_number = data.phone_number || '';
    this.email = data.email || '';
  }
}
