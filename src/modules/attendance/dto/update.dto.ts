import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateDto{
    @ApiProperty()
    @IsBoolean()
    isPresent:boolean
}