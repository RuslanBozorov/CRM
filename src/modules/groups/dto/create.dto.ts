import { ApiProperty } from '@nestjs/swagger';
import { WeekDay } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateGroupDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;
  @ApiProperty()
  @IsNumber()
  course_id: number;
  @ApiProperty()
  @IsNumber()
  teacher_id: number;
  @ApiProperty()
  @IsNumber()
  room_id: number;
  @ApiProperty()
  @IsString()
  start_date: string;
  @ApiProperty({
    isArray: true,
    enum: WeekDay,
    example: [WeekDay.MONDAY, WeekDay.WEDNESDAY, WeekDay.FRIDAY],
  })
  @IsArray()
  @IsEnum(WeekDay, { each: true })
  week_day: WeekDay[];
  @ApiProperty()
  @IsString()
  start_time: string;
  @ApiProperty()
  @IsNumber()
  max_student: number;
}
