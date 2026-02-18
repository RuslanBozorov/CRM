import { PartialType } from '@nestjs/swagger';
import { CreateRoomDto } from './create.dto';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}
