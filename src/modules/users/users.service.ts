import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateAdminDto } from './dto/create.admin.dto';
import * as bcrypt from 'bcrypt';
import { Role, Status } from '@prisma/client';
import { UpdateAdminDto } from './dto/update.admin.dto';
@Injectable()
export class UsersService {
  // ================= Fix await for findId, correct error message, and format code =================
  constructor(private prisma: PrismaService) { }

  async getAllUsers() {
    return this.prisma.user.findMany({
      where: {
        status: Status.active,
        role: { in: [Role.ADMIN, Role.SUPERADMIN] }
      }
    });
  }

  async oneUser(id: number) {
    const findId = await this.prisma.user.findUnique({ where: { id: Number(id) } });
    if (!findId) {
      throw new NotFoundException('User Not found');
    }
    return findId;
  }

  async getDeleteArxiv() {
    const data = await this.prisma.user.findMany({
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


  async createAdmin(payload: CreateAdminDto) {
    const adminExists = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: payload.phone }, { email: payload.email }],
      },
    });

    if (adminExists) throw new ConflictException();

    const hashPass = await bcrypt.hash(payload.password, 10);

    await this.prisma.user.create({
      data: {
        ...payload,
        role: Role.ADMIN,
        password: hashPass,
      },
    });

    return {
      success: true,
      message: 'Create Admin successfully',
    };
  }

  async updateUser(id: number, payload: UpdateAdminDto) {
    const findId = await this.prisma.user.findUnique({ where: { id: Number(id) } });
    if (!findId) {
      throw new NotFoundException();
    }
    const data = await this.prisma.user.update({ where: { id: Number(id) }, data: payload });
    return {
      success: true,
      message: 'User updated',
      data,
    };
  }

  async deleteUser(id: number) {
    const findId = await this.prisma.user.findUnique({ where: { id: Number(id) } });
    if (!findId) {
      throw new NotFoundException();
    }

    if (findId.status === Status.inactive) {
      throw new BadRequestException("User already deleted")
    }
    const data = await this.prisma.user.update({
      where: { id: Number(id) },
      data: { status: Status.inactive }
    });
    return {
      success: true,
      message: 'User delete',
      data,
    };
  }
}
