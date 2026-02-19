import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateCourseDto } from './dto/create.dto';
import { UpdateCourseDto } from './dto/update.dto';
import { Status } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async createCourse(payload: CreateCourseDto) {
    const existCourse = await this.prisma.course.findUnique({
      where: { name: payload.name },
    });

    if (existCourse) throw new ConflictException('Room already exists');
    await this.prisma.course.create({
      data: payload,
    });

    return {
      success: true,
      message: 'Course Creadet',
    };
  }

  async getAllCourse() {
    const data = await this.prisma.course.findMany();
    return {
      success: true,
      message: 'All Course',
      data: data,
    };
  }

  async getOneCourse(id) {
    const existCourse = await this.prisma.course.findUnique({
      where: { id: Number(id) },
    });
    if (!existCourse) throw new NotFoundException();

    return {
      success: true,
      message: 'Get one Course',
      data: existCourse,
    };
  }

  async getDeleteArxiv(){
    const data = await this.prisma.course.findMany({
      where:{
        status:Status.inactive
      }
    })
    return{
      success:true,
      message:"Deleted courses arxiv",
      data:data
    }
  }

  async updateCourse(id, payload: UpdateCourseDto) {
    const findId = this.prisma.course.findUnique({ where: { id: Number(id) } });
    if (!findId) {
      throw new NotFoundException();
    }
    const data = await this.prisma.course.update({
      where: { id: Number(id) },
      data: payload,
    });
    return {
      success: true,
      message: 'Course Update',
      data,
    };
  }

  async deleteCourse(id : number) {
    const findId = await this.prisma.course.findUnique({ where: { id: Number(id) } });
           if (!findId) {
             throw new NotFoundException();
           }
       
           if(findId.status === Status.inactive){
             throw new BadRequestException("User already deleted")
           }
           const data = await this.prisma.course.update({
              where: { id:Number(id) },
              data:{status:Status.inactive}
              });
           return {
             success: true,
             message: 'Course delete',
             data,
           };
  }
}
