import {
  BadRequestException,
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
  // ================= Fix typo: 'Creadet' to 'Created' and run Prettier =================
  constructor(private prisma: PrismaService) { }

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
      message: 'Room Created',
    };
  }

  async getAllRooms() {
    return this.prisma.room.findMany({
      where: { status: Status.active },
    });
  }

  async getOneRoom(id: number) {
    const findId = await this.prisma.room.findUnique({ where: { id } });
    if (!findId) throw new NotFoundException();
    return {
      success: true,
      message: 'Get one Room',
      data: findId,
    };
  }

  async getDeleteArxiv() {
    const data = await this.prisma.room.findMany({
      where: {
        status: Status.inactive
      }
    })
    return {
      success: true,
      message: "Deleted groups arxiv",
      data: data
    }
  }

  async updateRoom(id: number, payload: UpdateRoomDto) {
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

  async deleteRoom(id: number) {
    const findId = await this.prisma.room.findUnique({ where: { id: Number(id) } });
    if (!findId) {
      throw new NotFoundException();
    }

    if (findId.status === Status.inactive) {
      throw new BadRequestException("Room already deleted")
    }
    const data = await this.prisma.room.update({
      where: { id: Number(id) },
      data: { status: Status.inactive }
    });
    return {
      success: true,
      message: 'Room delete',
      data,
    };
  }
}
