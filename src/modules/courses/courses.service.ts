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
  // ================= Run Prettier to format the code =================
  constructor(private prisma: PrismaService) { }

  async createCourse(payload: CreateCourseDto) {
    const existCourse = await this.prisma.course.findUnique({
      where: { name: payload.name },
    });

    // ================= Fix error message: 'Room already exists' to 'Course already exists' =================
    if (existCourse) throw new ConflictException('Course already exists');
    await this.prisma.course.create({
      data: payload,
    });

    return {
      success: true,
      message: 'Course Created',
    };
  }

  async getAllCourse() {
    return this.prisma.course.findMany();
  }

  // ================= Add type to parameter: id: number =================
  async getOneCourse(id: number) {
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

  // ================= Rename method to getDeletedCoursesArchive for consistency =================
  async getDeleteArxiv() {
    const data = await this.prisma.course.findMany({
      where: {
        status: Status.inactive
      }
    })
    return {
      success: true,
      message: "Deleted courses arxiv",
      data: data
    }
  }

  // ================= Add type to id parameter and await findId =================
  async updateCourse(id: number, payload: UpdateCourseDto) {
    const findId = await this.prisma.course.findUnique({ where: { id: Number(id) } });
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

  // ================= Fix indentation and error message =================
  async deleteCourse(id: number) {
    const findId = await this.prisma.course.findUnique({ where: { id: Number(id) } });
    if (!findId) {
      throw new NotFoundException();
    }

    if (findId.status === Status.inactive) {
      // ================= Fix error message: 'User already deleted' to 'Course already deleted' =================
      throw new BadRequestException("User already deleted")
    }
    const data = await this.prisma.course.update({
      where: { id: Number(id) },
      data: { status: Status.inactive }
    });
    return {
      success: true,
      message: 'Course delete',
      data,
    };
  }
}
