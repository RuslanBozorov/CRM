import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateLessonDto } from './dto/create.lesson.dto';
import { Role, Status } from '@prisma/client';

@Injectable()
export class LessonService {
    constructor(private prisma : PrismaService){}

    async createLesson(payload : CreateLessonDto,user:{id:number,role:Role}){

        const existGroup = await this.prisma.group.findFirst({
            where:{
                id:payload.group_id,
                status:Status.active
            }
        })


        if(!existGroup){
            throw new NotFoundException("Group not found with this id")
        }

        if(user.role == "TEACHER" && existGroup.teacher_id != user.id){
            if(existGroup.teacher_id != user.id){
                throw new ForbiddenException("Bu sizning guruhingiz emas :(")
            }
        }

        await this.prisma.lesson.create({
            data:{
                ...payload,
                teacher_id : user.role == "TEACHER" ? user.id : null,
                user_id : user.role != "TEACHER" ? user.id : null

            }
        })

        return{
            success:true,
            message:"Lesson created"
        }
    }


    async getAllLessons(){
        const lessons = await this.prisma.lesson.findMany({
            where:{
                status:"active"
            }
        })

        return {
            success:true,
            message:"All Lessons",
            data:lessons
        }
    }

    async getOneLesson(id : number){
        const existLesson = await this.prisma.lesson.findUnique({where:{id:Number(id)}})

        if(!existLesson){
            throw new NotFoundException("Lesson not found with this id")
        }

        return{
            success:true,
            message:"Get one Lesson",
            data:existLesson
        }
    }


    async getLessonArxiv(){
        const data = await this.prisma.lesson.findMany({
            where:{
                status:"inactive"
            }
        })

        return{
            success:true,
            message:"Get lesson arxiv",
            data:data
        }
    }




    async deleteLesson(id:number){
        const existLesson = await this.prisma.lesson.findUnique({where:{id:Number(id)}})

        if(!existLesson){
            throw new NotFoundException("Lesson not found with this id")
        }

        if(existLesson.status == "inactive"){
             throw new BadRequestException("Lesson already deleted")
        }

        const data = await this.prisma.lesson.update({
            where:{id:Number(id)},
            data:{status:Status.inactive}
        })

        return{
            success:true,
            message:"Get one Lesson",
            data:data
        }
    }


}
