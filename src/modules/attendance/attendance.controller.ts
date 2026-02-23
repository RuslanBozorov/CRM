import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UpdateDto } from './dto/update.dto';
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @ApiOperation({
        summary: `${Role.SUPERADMIN} ${Role.ADMIN} ${Role.TEACHER}`,
    })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER)
    @Get('all')
    getAllAttendance() {
        return this.attendanceService.getAllAttendance()
    }


    @ApiOperation({
        summary: `${Role.SUPERADMIN} ${Role.ADMIN} ${Role.TEACHER}`,
    })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER)
    @Post()
    createAttendance(@Body() payload: CreateAttendanceDto, @Req() req: Request) {
        return this.attendanceService.createAttendance(payload, req['user'])
    }


    @ApiOperation({
        summary: `${Role.SUPERADMIN} ${Role.ADMIN} ${Role.TEACHER}`,
    })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER)
    @Patch('update/:id')
    updateAttendance(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateDto) {
        return this.attendanceService.updateAttendance(id, payload)
    }


    @ApiOperation({
        summary: `${Role.SUPERADMIN} ${Role.ADMIN} ${Role.TEACHER}`,
    })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER)
    @Delete('delete/all')
    deleteAttendance() {
        return this.attendanceService.deleteAttendance()
    }

}
