import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}
  @Post('user/login')
  userLogin(@Body() payload: LoginDto) {
    return this.AuthService.userLogin(payload);
  }

  @Post('teacher/login')
  teacherLogin(@Body() payload: LoginDto) {
    return this.AuthService.teacherLogin(payload);
  }

  @Post('student/login')
  studentLogin(@Body() payload: LoginDto) {
    return this.AuthService.studentLogin(payload);
  }
}
