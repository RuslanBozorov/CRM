import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateTeacherDto } from './dto/create.teacher';
import * as bcrypt from 'bcrypt';
import { UpdateTeacherDto } from './dto/update.teacher.dto';
@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}
  async createTeacher(payload: CreateTeacherDto, filename: string) {
    const existUser = await this.prisma.student.findFirst({
      where: {
        OR: [{ phone: payload.phone }, { email: payload.email }],
      },
    });

    if (existUser) {
      throw new ConflictException();
    }
    const hashPass = await bcrypt.hash(payload.password, 10);
    await this.prisma.teacher.create({
      data: {
        first_name: payload.first_name,
        last_name: payload.last_name,
        photo: filename ?? null,
        phone: payload.phone,
        email: payload.email,
        password: hashPass,
        address: payload.address,
      },
    });
    return {
      success: true,
      message: 'Teacher create',
    };
  }

   async getAllTeacher() {
          await this.prisma.teacher.findMany()
          return {
              success: true,
              message: "All Teachers"
          }
      }
  
      async getOneTeacher(id) {
          const existStudent = await this.prisma.teacher.findUnique(id)
          if (!existStudent) throw new NotFoundException()
          await this.prisma.teacher.findUnique(id)
          return {
              success: true,
              message: "Get one Teacher"
          }
      }
  
     async updateTeacher(id, payload: UpdateTeacherDto) {
         const findId = this.prisma.teacher.findUnique({ where: { id: Number(id) } });
         if (!findId) {
           throw new NotFoundException();
         }
         await this.prisma.teacher.update({ where: { id: Number(id) }, data: payload });
         return {
           success: true,
           message: 'Teacher Update',
         };
       }
     
       async deleteTeacher(id) {
         const findId = this.prisma.teacher.findUnique({ where: { id: Number(id) } });
         if (!findId) {
           throw new NotFoundException();
         }
         await this.prisma.teacher.delete({ where: { id } });
         return {
           success: true,
           message: 'Teacher delete',
         };
       }
}
