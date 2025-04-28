import { IsString, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class RegisterDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsPhoneNumber()
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  retype_password: string;

  role_id: number = 1;

  constructor(data: any) {
    this.name = data.name;
    this.phone_number = data.phone_number;
    this.password = data.password;
    this.retype_password = data.retype_password;
    this.role_id = data.role_id || 1;
  }
}
