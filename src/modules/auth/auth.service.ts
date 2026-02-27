import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
@Injectable()
export class AuthService {
  // ================= Extract common login logic to reduce duplication =================
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async userLogin(payload: LoginDto) {
    const existUser = await this.prisma.user.findUnique({
      where: { phone: payload.phone },
    });

    if (!existUser) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    const isMatch = await bcrypt.compare(payload.password, existUser.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    return {
      success: true,
      message: 'Login successful',
      accessToken: this.jwtService.sign({
        id: existUser.id,
        email: existUser.email,
        role: existUser.role,
      }),
      user: {
        first_name: existUser.first_name,
        last_name: existUser.last_name,
        role: existUser.role,
        phone: existUser.phone,
      }
    };
  }

  async teacherLogin(payload: LoginDto) {
    const existUser = await this.prisma.teacher.findUnique({
      where: { phone: payload.phone },
    });

    if (!existUser) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    const isMatch = await bcrypt.compare(payload.password, existUser.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    return {
      success: true,
      message: 'Login successful',
      accessToken: this.jwtService.sign({
        id: existUser.id,
        email: existUser.email,
        role: Role.TEACHER,
      }),
      user: {
        first_name: existUser.first_name,
        last_name: existUser.last_name,
        role: Role.TEACHER,
        phone: existUser.phone,
      }
    };
  }

  async studentLogin(payload: LoginDto) {
    const existUser = await this.prisma.student.findUnique({
      where: { phone: payload.phone },
    });

    if (!existUser) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    const isMatch = await bcrypt.compare(payload.password, existUser.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    return {
      success: true,
      message: 'Login successful',
      accessToken: this.jwtService.sign({
        id: existUser.id,
        email: existUser.email,
        role: Role.STUDENT,
      }),
      user: {
        first_name: existUser.first_name,
        last_name: existUser.last_name,
        role: Role.STUDENT,
        phone: existUser.phone,
      }
    };
  }
}
