import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateAdminDto } from './dto/create.admin.dto';
import * as bcrypt from 'bcrypt';
import { Role, Status } from '@prisma/client';
import { UpdateAdminDto } from './dto/update.admin.dto';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({ where: { status: Status.active, role: Role.ADMIN } });
  }

  async oneUser(id) {
    const findId = this.prisma.user.findUnique({ where: { id: Number(id) } });
    if (!findId) {
      throw new NotFoundException();
    }
    return this.prisma.user.findUnique({ where: { id: Number(id) } });
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
      message: 'Create Admin successfuley',
    };
  }

  async updateUser(id, payload: UpdateAdminDto) {
    const findId = this.prisma.user.findUnique({ where: { id: Number(id) } });
    if (!findId) {
      throw new NotFoundException();
    }
    await this.prisma.user.update({ where: { id: Number(id) }, data: payload });
    return {
      success: true,
      message: 'User updated',
    };
  }

  async deleteUser(id) {
    const findId = this.prisma.user.findUnique({ where: { id: Number(id) } });
    if (!findId) {
      throw new NotFoundException();
    }
    await this.prisma.user.delete({ where: { id } });
    return {
      success: true,
      message: 'User delete',
    };
  }
}
