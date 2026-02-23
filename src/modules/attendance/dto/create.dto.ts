import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class CreateAttendanceDto{
    @ApiProperty()
    @IsNumber()
    lesson_id:number


    @ApiProperty()
    @IsNumber()
    student_id:number

    @ApiProperty()
    @IsNumber()
    isPresent: boolean
}