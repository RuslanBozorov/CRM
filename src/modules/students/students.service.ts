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
@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

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

  async getAllStudets() {
    const data = await this.prisma.student.findMany();
    return {
      success: true,
      message: 'All Students',
      data,
    };
  }

  async getOneStudent(id : number) {
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


   async getDeleteArxiv(){
      const data = await this.prisma.student.findMany({
        where:{
          status:StudentStatus.inactive
        }
      })
      return{
        success:true,
        message:"Deleted groups arxiv",
        data:data
      }
    }


  async updateStudent(id : number, payload: UpdateStudentDto) {
    const findId = this.prisma.student.findUnique({
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

  async deleteStudent(id : number) {
    const findId = await this.prisma.student.findUnique({ where: { id: Number(id) } });
        if (!findId) {
          throw new NotFoundException();
        }
    
        if(findId.status === Status.inactive){
          throw new BadRequestException("User already deleted")
        }
        const data = await this.prisma.student.update({
           where: { id:Number(id) },
           data:{status:StudentStatus.inactive}
           });
        return {
          success: true,
          message: 'Student delete',
          data,
        };
  }
}
