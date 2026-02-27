import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, Min, IsOptional, IsString } from 'class-validator'

export class PaginationDto {

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1

  @ApiPropertyOptional()

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10
  
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?:string
}