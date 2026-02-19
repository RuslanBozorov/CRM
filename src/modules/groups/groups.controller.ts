import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create.dto';
import { UpdateGroupDto } from './dto/update.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { filterDto } from './dto/search.dto';
@ApiBearerAuth()
@Controller('groups')
export class GroupsController {
  // ================= Run Prettier to format the code =================
  constructor(private readonly groupService: GroupsService) {}
  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('all')
  getAllGroups(@Query() query: filterDto) {
    return this.groupService.getAllGroups(query);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('one/:id')
  getOneGroup(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.getOneGroup(id);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('one/students/:groupId')
  getGroupOne(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.groupService.getGroupOne(groupId);
  }

   @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get("delete-arxiv")
  getDeleteArxiv(){
    return this.groupService.getDeleteArxiv()
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Post()
  createGroup(@Body() payload: CreateGroupDto) {
    return this.groupService.createGroup(payload);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Put('update/:id')
  updateGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateGroupDto,
  ) {
    return this.groupService.updateGroup(id, payload);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete('delete/:id')
  deleteGroup(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.deleteGroup(id);
  }
}
