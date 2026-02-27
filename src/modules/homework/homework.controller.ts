import { Body, Controller, Get, Post, Req, UnsupportedMediaTypeException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CreateHomewrokDto } from './dto/create.dto';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
@ApiBearerAuth()
@Controller('homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) { }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN} ${Role.TEACHER}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER)
  @Get('all')
  getAllHomework() {
    return this.homeworkService.getAllHomework()
  }


  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        lesson_id: { type: 'number' },
        group_id: { type: 'number' },
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' }
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './src/uploads/files',
        filename: (req, file, cb) => {
          const filename = Date.now() + '.' + file.mimetype.split('/')[1];
          cb(null, filename);
        },
      }),
    }),
  )
  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN} ${Role.TEACHER}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER)
  @Post()
  createHomework(@Req() req: Request, @Body() payload: CreateHomewrokDto, @UploadedFile() file?: Express.Multer.File) {
    return this.homeworkService.createHomework(payload, req['user'], file?.filename)
  }
}
