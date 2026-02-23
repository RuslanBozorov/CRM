import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateHomewrokDto } from './dto/create.dto';
import { Role } from '@prisma/client';

@Injectable()
export class HomeworkService {
    constructor(private prisma : PrismaService){}

    async getAllHomework(){
        const existHomework = await this.prisma.homework.findMany()

        if(!existHomework){
            throw new NotFoundException("HomeWorks Not found")
        }

        return{
            success:true,
            message:"All Homeworks",
            data:existHomework
        }
    }

   async createHomework(payload:CreateHomewrokDto,currentUser:{id:number,role:Role},filename?){
    const existLesson = await this.prisma.lesson.findFirst({
        where:{
            id:payload.lesson_id
        }
    })

    if(!existLesson){
        throw new NotFoundException("Lesson not found")
    }
    await this.prisma.homework.create({
        data:{
            ...payload,
            file:filename,
             teacher_id: currentUser.role == "TEACHER" ? currentUser.id : null,
             user_id: currentUser.role != "TEACHER" ? currentUser.id : null
        }
    })

    return{
        success:true,
        message:"Homework recorded"
    }
   }
}
