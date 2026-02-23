import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService : AttendanceService){}

    @ApiOperation({
        summary: `${Role.SUPERADMIN} ${Role.ADMIN} ${Role.TEACHER}`,
      })
      @UseGuards(AuthGuard, RolesGuard)
      @Roles(Role.SUPERADMIN, Role.ADMIN,Role.TEACHER)
    @Post()
    createAttendance(@Body() payload : CreateAttendanceDto,@Req() req:Request){
        return this.attendanceService.createAttendance(payload,req['user'])
    }
}
