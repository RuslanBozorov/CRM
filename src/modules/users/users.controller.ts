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
import { UsersService } from './users.service';
import { CreateAdminDto } from './dto/create.admin.dto';
import { UpdateAdminDto } from './dto/update.admin.dto';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/role';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/role.guard';
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @ApiOperation({
    summary: `${Role.SUPERADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Get('admin/all')
  getAllUsers() {
    return this.userService.getAllUsers();
  }
  @ApiOperation({
    summary: `${Role.SUPERADMIN}  ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('oneUser/:id')
  oneUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.oneUser(id);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get("delete-arxiv")
  getDeleteArxiv(){
    return this.userService.getDeleteArxiv()
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}  ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Post('admin')
  createAdmin(@Body() payload: CreateAdminDto) {
    return this.userService.createAdmin(payload);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}  ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Put('update/:id')
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateAdminDto) {
    return this.userService.updateUser(id, payload);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}  ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete('delete/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
