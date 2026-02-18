import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateRoomDto } from './dto/create.dto';
import { UpdateRoomDto } from './dto/update.tdo';
import { Status } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async createRoom(payload: CreateRoomDto) {
    const existRoom = await this.prisma.room.findUnique({
      where: { name: payload.name },
    });

    if (existRoom) throw new ConflictException('Room already exists');
    await this.prisma.room.create({
      data: payload,
    });

    return {
      success: true,
      message: 'Room Creadet',
    };
  }

  async getAllRooms() {
    const rooms = await this.prisma.room.findMany({
      where: { status: Status.active },
    });

    return {
      success: true,
      data: rooms,
    };
  }

  async getOneRoom(id) {
    const findId = await this.prisma.room.findUnique({ where: { id } });
    if (!findId) throw new NotFoundException();
    return {
      success: true,
      message: 'Get one Room',
      data: findId,
    };
  }

  async updateRoom(id, payload: UpdateRoomDto) {
    const findId = this.prisma.room.findUnique({ where: { id: Number(id) } });
    if (!findId) {
      throw new NotFoundException();
    }
    const data = await this.prisma.room.update({
      where: { id: Number(id) },
      data: payload,
    });
    return {
      success: true,
      message: 'Room Update',
      data,
    };
  }

  async deleteRoom(id) {
    const findId = this.prisma.room.findUnique({ where: { id: Number(id) } });
    if (!findId) {
      throw new NotFoundException();
    }
    const data = await this.prisma.room.delete({ where: { id } });
    return {
      success: true,
      message: 'Room delete',
      data,
    };
  }
}
