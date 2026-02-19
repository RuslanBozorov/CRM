import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateStudentGroupDto } from './dto/create.dto';
import { UpdateStudentGroupDto } from './dto/update.dto';
import { Status } from '@prisma/client';

@Injectable()
export class StudentGroupService {
  constructor(private prisma: PrismaService) {}

  async getAllStudentGroup() {
    const studentGroup = await this.prisma.studentGroup.findMany({
      where: {
        status: Status.active,
      },
    });

    return {
      success: true,
      data: studentGroup,
    };
  }

  async getOneStudentGroup(id: number) {
    const studentGroup = await this.prisma.studentGroup.findFirst({
      where: {
        id,
        status: Status.active,
      },
      select: {
        id: true,
        status: true,
        students: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
            email: true,
          },
        },
        groups: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!studentGroup) {
      throw new NotFoundException('Student group not found with id');
    }

    return {
      success: true,
      data: studentGroup,
    };
  }


  async getDeleteArxiv(){
    const data = await this.prisma.studentGroup.findMany({
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

  async createStudentGroup(payload: CreateStudentGroupDto) {
    const existStudent = await this.prisma.student.findFirst({
      where: {
        id: payload.student_id,
        status: Status.active,
      },
    });

    if (!existStudent)
      throw new NotFoundException('Student not found with this id');

    const existGroup = await this.prisma.group.findFirst({
      where: {
        id: payload.group_id,
        status: Status.active,
      },
    });

    if (!existGroup)
      throw new NotFoundException('Group not found with this id');

    const existGroupStudent = await this.prisma.studentGroup.findFirst({
      where: {
        student_id: payload.student_id,
        group_id: payload.group_id,
        status: Status.active,
      },
    });

    if (existGroupStudent) {
      throw new ConflictException('Student is already in group');
    }

    const existGroupStudentCount = await this.prisma.studentGroup.count({
      where: {
        group_id: payload.group_id,
      },
    });

    if (existGroupStudentCount >= existGroup.max_student) {
      throw new BadRequestException('Group is full');
    }

    await this.prisma.studentGroup.create({
      data: payload,
    });

    return {
      success: true,
      message: 'Student added group',
    };
  }

  async updateStudentGroup(id: number, payload: UpdateStudentGroupDto) {
    const existStudentGroup = await this.prisma.studentGroup.findFirst({
      where: {
        id,
        status: Status.active,
      },
    });

    if (!existStudentGroup) {
      throw new NotFoundException('Student group not found with id');
    }

    const studentId = payload.student_id ?? existStudentGroup.student_id;
    const groupId = payload.group_id ?? existStudentGroup.group_id;

    if (payload.student_id) {
      const existStudent = await this.prisma.student.findFirst({
        where: {
          id: payload.student_id,
          status: Status.active,
        },
      });
      if (!existStudent)
        throw new NotFoundException('Student not found with this id');
    }

    let existGroupMaxStudent: number | null = null;
    if (payload.group_id) {
      const existGroup = await this.prisma.group.findFirst({
        where: {
          id: payload.group_id,
          status: Status.active,
        },
        select: {
          max_student: true,
        },
      });

      if (!existGroup)
        throw new NotFoundException('Group not found with this id');
      existGroupMaxStudent = existGroup.max_student;
    }

    const duplicate = await this.prisma.studentGroup.findFirst({
      where: {
        student_id: studentId,
        group_id: groupId,
        status: Status.active,
        NOT: { id },
      },
    });

    if (duplicate) {
      throw new ConflictException('Student is already in group');
    }

    if (payload.group_id && payload.group_id !== existStudentGroup.group_id) {
      if (existGroupMaxStudent === null) {
        const existGroup = await this.prisma.group.findFirst({
          where: {
            id: groupId,
            status: Status.active,
          },
          select: {
            max_student: true,
          },
        });
        if (!existGroup)
          throw new NotFoundException('Group not found with this id');
        existGroupMaxStudent = existGroup.max_student;
      }

      const groupStudentCount = await this.prisma.studentGroup.count({
        where: {
          group_id: groupId,
          status: Status.active,
        },
      });

      if (groupStudentCount >= existGroupMaxStudent) {
        throw new BadRequestException('Group is full');
      }
    }

    const data = await this.prisma.studentGroup.update({
      where: { id },
      data: payload,
    });

    return {
      success: true,
      message: 'Student group update',
      data,
    };
  }

  async deleteStudentGroup(id: number) {
    const existStudentGroup = await this.prisma.studentGroup.findUnique({
      where: { id },
    });

    if (!existStudentGroup) {
      throw new NotFoundException('Student group not found with id');
    }

    await this.prisma.studentGroup.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Student group delete',
    };
  }
}
