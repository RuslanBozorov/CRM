import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class filterDto{
    @ApiPropertyOptional()
    @IsOptional()
    groupName? : string
}