import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { TeachersService } from './teachers.service';
import { Roles } from 'src/common/decorators/role';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CreateTeacherDto } from './dto/create.teacher';
import { UpdateTeacherDto } from './dto/update.teacher.dto';

@ApiBearerAuth()
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teacherService: TeachersService) { }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('all')
  getAllTeachers() {
    return this.teacherService.getAllTeacher();
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('one/:id')
  getOneStudent(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.getOneTeacher(id);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get("delete-arxiv")
  getDeleteArxiv() {
    return this.teacherService.getDeleteArxiv()
  }

  @ApiOperation({
    summary: `${Role.TEACHER} ${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.SUPERADMIN, Role.ADMIN)
  @Get('my-groups')
  getMyGroups(@Req() req: any) {
    return this.teacherService.getMyGroups(req.user);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Post()
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
    }),
  )
  createTeacher(
    @Body() payload: CreateTeacherDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.teacherService.createTeacher(payload, file?.filename);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Put('update/:id')
  updateStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateTeacherDto,
  ) {
    return this.teacherService.updateTeacher(id, payload);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete('delete/:id')
  deleteStudent(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.deleteTeacher(id);
  }
}
