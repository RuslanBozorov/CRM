import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateAdminDto } from './dto/create.admin.dto';
import { UpdateAdminDto } from './dto/update.admin.dto';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/role';
import { Role } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/role.guard';
  @ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @UseGuards(AuthGuard,RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Get('admin/all')
  getAllUsers() {
    return this.userService.getAllUsers();
  }
  @UseGuards(AuthGuard)
  @Get("oneUser/:id")
  oneUser(@Param("id",ParseIntPipe) id : number){
      return this.userService.oneUser(id)
  }

  @UseGuards(AuthGuard)
  @Post('admin')
  createAdmin(@Body() payload: CreateAdminDto) {
    return this.userService.createAdmin(payload);
  }

  @UseGuards(AuthGuard)
  @Put("update/:id")
  updateUser(@Param("id",ParseIntPipe) id : number, @Body() payload : UpdateAdminDto){
    return this.userService.updateUser(id,payload)
  }

  @UseGuards(AuthGuard)
  @Delete("delete/:id")
  deleteUser(@Param("id",ParseIntPipe) id : number){
    return this.userService.deleteUser(id)
  }
}
