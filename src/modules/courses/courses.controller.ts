import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { CreateCourseDto } from './dto/create.dto';
import { UpdateCourseDto } from './dto/update.dto';
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly courseService: CoursesService) {}
  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('all')
  getAllCourse() {
    return this.courseService.getAllCourse();
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('one/:id')
  getOneCourse(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.getOneCourse(id);
  }

   @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get("delete-arxiv")
  getDeleteArxiv(){
    return this.courseService.getDeleteArxiv()
  }
  

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Post()
  createRoom(@Body() payload: CreateCourseDto) {
    return this.courseService.createCourse(payload);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Put('update/:id')
  updateCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateCourseDto,
  ) {
    return this.courseService.updateCourse(id, payload);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete('delete/:id')
  deleteCourse(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.deleteCourse(id);
  }
}
