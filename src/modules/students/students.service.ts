import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create.student.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateStudentDto } from './dto/update.student.dto';
import { EmailService } from 'src/common/email/email.service';
import { Status, StudentStatus } from '@prisma/client';
import { PaginationDto } from './dto/query.dto';
@Injectable()
export class StudentsService {
  // ================= Run Prettier to format the code =================
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) { }

  async createStudent(payload: CreateStudentDto, filename: string) {
    const existUser = await this.prisma.student.findFirst({
      where: {
        OR: [{ phone: payload.phone }, { email: payload.email }],
      },
    });

    if (existUser) {
      throw new ConflictException();
    }
    const hashPass = await bcrypt.hash(payload.password, 10);
    await this.prisma.student.create({
      data: {
        first_name: payload.first_name,
        last_name: payload.last_name,
        photo: filename ?? null,
        phone: payload.phone,
        birth_date: new Date(payload.birth_date),
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
      message: 'Student create',
    };
  }

  async getAllStudents(pagenation : PaginationDto) {
    const {page=1, limit=10,search} = pagenation
    const students = await this.prisma.student.findMany({
      where:{
        status:Status.active,
        ...(search && {
          first_name: {
            contains:search,
            mode:'insensitive'
          }
        })
      
       
      },
      select:{
        id:true,
        first_name:true,
        last_name:true,
        phone:true,
        email:true,
        address:true,
        birth_date:true
      },
      skip:(page - 1) * limit,
      take:limit ? +limit : 10 
    })

    return{
      success:true,
      data:students
    }
  }

  async getOneStudent(id: number) {
    const existStudent = await this.prisma.student.findUnique({
      where: { id: Number(id) },
    });
    if (!existStudent) throw new NotFoundException();

    return {
      success: true,
      message: 'Get one Student',
      data: existStudent,
    };
  }


  async getDeleteArxiv() {
    const data = await this.prisma.student.findMany({
      where: {
        status: StudentStatus.inactive
      }
    })
    return {
      success: true,
      message: "Deleted student arxiv",
      data: data
    }
  }


  async updateStudent(id: number, payload: UpdateStudentDto) {
    const findId = await this.prisma.student.findUnique({
      where: { id: Number(id) },
    });
    if (!findId) {
      throw new NotFoundException();
    }
    const data = await this.prisma.student.update({
      where: { id: Number(id) },
      data: payload,
    });
    return {
      success: true,
      message: 'Student Update',
      data,
    };
  }

  async deleteStudent(id: number) {
    const findId = await this.prisma.student.findUnique({ where: { id: Number(id) } });
    if (!findId) {
      throw new NotFoundException();
    }

    if (findId.status === Status.inactive) {
      throw new BadRequestException("User already deleted")
    }
    const data = await this.prisma.student.update({
      where: { id: Number(id) },
      data: { status: StudentStatus.inactive }
    });
    return {
      success: true,
      message: 'Student delete',
      data,
    };
  }

  async getMyGroups(userId: number) {
    const studentGroups = await this.prisma.studentGroup.findMany({
      where: {
        student_id: userId,
        status: Status.active,
        groups: {
          status: 'active' as any,
        },
      },
      select: {
        groups: {
          select: {
            id: true,
            name: true,
            description: true,
            start_date: true,
            start_time: true,
            week_day: true,
            courses: {
              select: {
                id: true,
                name: true,
              },
            },
            teachers: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
              },
            },
            rooms: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return studentGroups.map((sg) => sg.groups);
  }
}
