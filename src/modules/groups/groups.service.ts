import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateGroupDto } from './dto/create.dto';
import { UpdateGroupDto } from './dto/update.dto';
import { GroupStatus, Status } from '@prisma/client';
import { filterDto } from './dto/search.dto';

@Injectable()
export class GroupsService {
  // ================= Run Prettier to format the code =================
  constructor(private prisma: PrismaService) {}

  async getAllGroups(query: filterDto) {
    const { groupName, max_student } = query;
    let where = {
      status: Status.active,
      name: groupName,
      max_student: max_student ? parseInt(max_student) : undefined,
    };
    if (groupName) {
      where['name'] = groupName;
    }
    const allGroup = await this.prisma.group.findMany({
      where,
      select: {
        id: true,
        name: true,
        max_student: true,
        start_date: true,
        start_time: true,
        week_day: true,

        courses: {
          select: {
            id: true,
            name: true,
          },
        },
        rooms: {
          select: {
            id: true,
            name: true,
          },
        },
        teachers: {
          select: {
            id: true,
            first_name: true,
          },
        },
      },
    });
    return {
      success: true,
      message: 'All groups',
      data: allGroup,
    };
  }

  async getOneGroup(groupId: number) {
    const group = await this.prisma.group.findFirst({
      where: {
        id: groupId,
        status: Status.active,
      },
      select: {
        id: true,
        name: true,
        description: true,
        max_student: true,
        start_date: true,
        start_time: true,
        week_day: true,
        courses: {
          select: {
            id: true,
            name: true,
          },
        },
        rooms: {
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
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found with id');
    }

    return {
      success: true,
      data: group,
    };
  }

  async getGroupOne(groupId: number) {
    const existGroup = await this.prisma.group.findFirst({
      where: {
        id: groupId,
        status: Status.active,
      },
    });

    if (!existGroup) {
      throw new NotFoundException('Group not found with id');
    }

    const groupStudents = await this.prisma.studentGroup.findMany({
      where: {
        group_id: groupId,
        status: Status.active,
      },
      select: {
        students: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
            email: true,
            photo: true,
            birth_date: true,
            created_at: true,
          },
        },
      },
    });

    const dataFormatter = groupStudents.map((el) => el.students);
    return {
      success: true,
      data: dataFormatter,
    };
  }


  async getDeleteArxiv(){
    const data = await this.prisma.group.findMany({
      where:{
        status:GroupStatus.inactive
      }
    })
    return{
      success:true,
      message:"Deleted groups arxiv",
      data:data
    }
  }


  async createGroup(payload: CreateGroupDto) {
    const timeToMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const existRoom = await this.prisma.room.findFirst({
      where: { id: payload.room_id, status: Status.active },
    });
    if (!existRoom)
      throw new NotFoundException('Room is not found with this id');

    const existCourse = await this.prisma.course.findFirst({
      where: { id: payload.course_id, status: Status.active },
      select: { duration_hours: true },
    });
    if (!existCourse)
      throw new NotFoundException('Course is not found with this id');

    const existTeacher = await this.prisma.teacher.findFirst({
      where: { id: payload.teacher_id, status: Status.active },
    });
    if (!existTeacher)
      throw new NotFoundException('Teacher is not found with this id');

    const existGroup = await this.prisma.group.findUnique({
      where: { name: payload.name },
    });
    if (existGroup) throw new ConflictException('Group already exists');

    const startNew = timeToMinutes(payload.start_time);
    const endNew = startNew + existCourse.duration_hours * 60;

    const existRoomGroups = await this.prisma.group.findMany({
      where: { room_id: payload.room_id, status: Status.active },
      select: {
        start_time: true,
        courses: { select: { duration_hours: true } },
      },
    });

    const isRoomBusy = existRoomGroups.some((el) => {
      const start = timeToMinutes(el.start_time);
      const end = start + el.courses.duration_hours * 60;
      return start < endNew && end > startNew;
    });

    if (isRoomBusy) throw new ConflictException('Room is busy at this time');

    const group = await this.prisma.group.create({
      data: payload,
    });

    return { success: true, message: 'Group created', data: group };
  }

  async updateGroup(groupId: number, payload: UpdateGroupDto) {
    const timeToMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const existGroup = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!existGroup) {
      throw new NotFoundException('Group not found with id');
    }

    if (payload.name && payload.name !== existGroup.name) {
      const duplicate = await this.prisma.group.findUnique({
        where: { name: payload.name },
      });
      if (duplicate) throw new ConflictException('Group already exists');
    }

    let courseDuration: number | null = null;
    if (payload.course_id) {
      const existCourse = await this.prisma.course.findFirst({
        where: { id: payload.course_id, status: Status.active },
        select: { duration_hours: true },
      });
      if (!existCourse)
        throw new NotFoundException('Course is not found with this id');
      courseDuration = existCourse.duration_hours;
    }

    if (payload.room_id) {
      const existRoom = await this.prisma.room.findFirst({
        where: { id: payload.room_id, status: Status.active },
      });
      if (!existRoom)
        throw new NotFoundException('Room is not found with this id');
    }

    if (payload.teacher_id) {
      const existTeacher = await this.prisma.teacher.findFirst({
        where: { id: payload.teacher_id, status: Status.active },
      });
      if (!existTeacher)
        throw new NotFoundException('Teacher is not found with this id');
    }

    const roomId = payload.room_id ?? existGroup.room_id;
    const courseId = payload.course_id ?? existGroup.course_id;
    const startTime = payload.start_time ?? existGroup.start_time;

    if (!courseDuration) {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        select: { duration_hours: true },
      });
      if (!course)
        throw new NotFoundException('Course is not found with this id');
      courseDuration = course.duration_hours;
    }

    if (payload.room_id || payload.start_time || payload.course_id) {
      const startNew = timeToMinutes(startTime);
      const endNew = startNew + courseDuration * 60;

      const existRoomGroups = await this.prisma.group.findMany({
        where: {
          room_id: roomId,
          status: Status.active,
          NOT: { id: groupId },
        },
        select: {
          start_time: true,
          courses: { select: { duration_hours: true } },
        },
      });

      const isRoomBusy = existRoomGroups.some((el) => {
        const start = timeToMinutes(el.start_time);
        const end = start + el.courses.duration_hours * 60;
        return start < endNew && end > startNew;
      });

      if (isRoomBusy) throw new ConflictException('Room is busy at this time');
    }

    const data = await this.prisma.group.update({
      where: { id: groupId },
      data: payload,
    });

    return {
      success: true,
      message: 'Group update',
      data,
    };
  }

  async deleteGroup(groupId: number) {
    const existGroup = await this.prisma.group.findUnique({
      where: { id: groupId },
      select:{id:true,status:true}
    });
    if (!existGroup) {
      throw new NotFoundException('Group not found with id');
    }

    await this.prisma.group.update({
      where: { id: groupId },
      data:{status:GroupStatus.inactive}
    });

    await this.prisma.studentGroup.updateMany({
      where: { id:groupId },
      data:{
        status:GroupStatus.inactive
      }
    });

    

    return {
      success: true,
      message: 'Group delete',
    };
  }
}
