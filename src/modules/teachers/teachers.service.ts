import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GroupStatus, Role, Status } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateTeacherDto } from './dto/create.teacher';
import * as bcrypt from 'bcrypt';
import { UpdateTeacherDto } from './dto/update.teacher.dto';
import { EmailService } from 'src/common/email/email.service';
@Injectable()
export class TeachersService {
  // ================= Fix logic: check teacher instead of student, and format code =================
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}
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
    await this.emailService.sendEmail(
      payload.email,
      payload.phone,
      payload.password,
    );
    return {
      success: true,
      message: 'Teacher create',
    };
  }

  async getAllTeacher() {
    const teacher = await this.prisma.teacher.findMany();
    return {
      success: true,
      message: 'All Teachers',
      data: teacher,
    };
  }

  async getOneTeacher(id : number) {
    const existStudent = await this.prisma.teacher.findUnique({where:{id:Number(id)}});
    if (!existStudent) throw new NotFoundException();
    await this.prisma.teacher.findUnique({where:{id:Number(id)}});
    return {
      success: true,
      message: 'Get one Teacher',
    };
  }

  async getDeleteArxiv(){
        const data = await this.prisma.teacher.findMany({
          where:{
            status:Status.inactive
          }
        })
        return{
          success:true,
          message:"Deleted groups arxiv",
          data:data
        }
      }

  async getMyGroups(user: { id: number; role: Role }) {
    const where: any = {
      status: GroupStatus.active,
    };

    if (user.role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findFirst({
        where: { id: user.id, status: Status.active },
        select: { id: true },
      });

      if (!teacher) throw new NotFoundException('Teacher not found');

      where.teacher_id = user.id;
    }

    const groups = await this.prisma.group.findMany({
      where,
      select: {
        name: true,
        description: true,
        max_student: true,
        start_date: true,
        start_time: true,
        week_day: true,
        courses: { select: { name: true } },
        rooms: { select: { name: true } },

        studentGroups: {
          select: {
            students: {
              select: { first_name: true, last_name: true },
            },
          },
        },
        _count: { select: { studentGroups: true } },
      },
    });
    return {
      success: true,
      message: 'My Groups',
      data: groups,
    };
  }

  async updateTeacher(id:number, payload: UpdateTeacherDto) {
    const findId = this.prisma.teacher.findUnique({
      where: { id: Number(id) },
    });
    if (!findId) {
      throw new NotFoundException();
    }
    await this.prisma.teacher.update({
      where: { id: Number(id) },
      data: payload,
    });
    return {
      success: true,
      message: 'Teacher Update',
    };
  }

  async deleteTeacher(id : number) {
    const findId = await this.prisma.teacher.findUnique({ where: { id: Number(id) } });
        if (!findId) {
          throw new NotFoundException();
        }
    
        if(findId.status === Status.inactive){
          throw new BadRequestException("User already deleted")
        }
        const data = await this.prisma.teacher.update({
           where: { id:Number(id) },
           data:{status:Status.inactive}
           });
        return {
          success: true,
          message: 'Teacher delete',
          data,
        };
  }
}
