import { PartialType } from '@nestjs/swagger';
import { CreateStudentGroupDto } from './create.dto';

export class UpdateStudentGroupDto extends PartialType(CreateStudentGroupDto) {}
