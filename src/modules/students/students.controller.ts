import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateStudentDto } from './dto/create.student.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { error } from 'console';
import { UpdateStudentDto } from './dto/update.student.dto';
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(private readonly studentService: StudentsService) {}
  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        phone: { type: 'string' },

        photo: { type: 'string', format: 'binary' },
        address: { type: 'string' },
        birth_date: { type: 'string', format: 'date', example: '2000-01-01' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './src/uploads',
        filename: (req, file, cb) => {
          const filename = Date.now() + '.' + file.mimetype.split('/')[1];
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        const existFile = ['png', 'jpg', 'jpeg'];

        if (!existFile.includes(file.mimetype.split('/')[1])) {
          cb(new UnsupportedMediaTypeException(), false);
        }
        cb(null, true);
      },
    }),
  )

 
  @ApiOperation({
    summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
  })
   @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN,Role.ADMIN)
  @Post("student/create")
  createStudent(
    @Body() payload: CreateStudentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.studentService.createStudent(payload, file.filename);
  }


   @ApiOperation({
    summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
  })
   @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN,Role.ADMIN)
  @Get("student/all")
  getAllStudent(){
    return this.studentService.getAllStudets()
  }

  @ApiOperation({
    summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
  })
   @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN,Role.ADMIN)
  @Get("student/one/:id")
  getOneStudent(@Param("id",ParseIntPipe) id : number){
    return this.studentService.getOneStudent(id)
  }




  @ApiOperation({
    summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
  })
   @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN,Role.ADMIN)
  @Put("student/update/:id")
  updateStudent(@Param("id",ParseIntPipe) id : number, @Body() payload : UpdateStudentDto){
    return this.studentService.updateStudent(id,payload)
  }

  @ApiOperation({
    summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
  })
   @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN,Role.ADMIN)
  @Delete("student/delete/:id")
  deleteStudent(@Param("id",ParseIntPipe) id : number){
    return this.studentService.deleteStudent(id)
  }
}
