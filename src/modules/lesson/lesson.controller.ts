import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create.lesson.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
@ApiBearerAuth()
@Controller('lesson')
export class LessonController {
    constructor(private readonly lessonService:LessonService){}

    @ApiOperation({
        summary:`${Role.ADMIN}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.SUPERADMIN)
    @Get("all")
    getAllLessons(){
        return this.lessonService.getAllLessons()
    }


     @ApiOperation({
        summary:`${Role.ADMIN}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.SUPERADMIN)
    @Get("lesson-one/:id")
    getOneLesson(@Param("id",ParseIntPipe) id : number){
        return this.lessonService.getOneLesson(id)
    }

    @ApiOperation({
        summary:`${Role.ADMIN}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.SUPERADMIN)
    @Get("lesson-arxiv")
    getLessonArxiv(){
        return this.lessonService.getLessonArxiv()
    }




    @ApiOperation({
        summary:`${Role.ADMIN} ${Role.TEACHER}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.ADMIN,Role.TEACHER,Role.SUPERADMIN)
    @Post()
    createLesson(@Body() payload : CreateLessonDto,@Req() req : Request){
        return this.lessonService.createLesson(payload,req["user"])
    }


    @Delete("delete-lesson/:id")
    deleteLesson(@Param("id",ParseIntPipe) id : number){
        return this.lessonService.deleteLesson(id)
    }
}
