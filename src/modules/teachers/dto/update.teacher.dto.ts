import { PartialType } from '@nestjs/swagger';
import { CreateTeacherDto } from './create.teacher';

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {}
