import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @ApiProperty()
  @IsMobilePhone('uz-UZ')
  phone: string;

  @ApiProperty()
  @IsEmail()
  @IsString()
  email: string;

  @IsDateString()
  @IsNotEmpty()
  birth_date: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;
}
