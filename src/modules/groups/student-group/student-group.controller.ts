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
import { StudentGroupService } from './student-group.service';
import { CreateStudentGroupDto } from './dto/create.dto';
import { UpdateStudentGroupDto } from './dto/update.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
@ApiBearerAuth()
@Controller('student-group')
export class StudentGroupController {
  // ================= Run Prettier to format the code =================
  constructor(private readonly studentGroupService: StudentGroupService) {}

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('all')
  getAllStudentGroup() {
    return this.studentGroupService.getAllStudentGroup();
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('one/:id')
  getOneStudentGroup(@Param('id', ParseIntPipe) id: number) {
    return this.studentGroupService.getOneStudentGroup(id);
  }


   @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get("delete-arxiv")
  getDeleteArxiv(){
    return this.studentGroupService.getDeleteArxiv()
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Post()
  createStudentGroup(@Body() payload: CreateStudentGroupDto) {
    return this.studentGroupService.createStudentGroup(payload);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Put('update/:id')
  updateStudentGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateStudentGroupDto,
  ) {
    return this.studentGroupService.updateStudentGroup(id, payload);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete('delete/:id')
  deleteStudentGroup(@Param('id', ParseIntPipe) id: number) {
    return this.studentGroupService.deleteStudentGroup(id);
  }
}
