import { ApiProperty } from '@nestjs/swagger';
import { IsMobilePhone, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsMobilePhone('uz-UZ')
  phone: string;

  @ApiProperty()
  @IsString()
  password: string;
}
