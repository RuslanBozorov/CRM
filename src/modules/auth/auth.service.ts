import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async Login(payload: LoginDto) {
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
      message: 'Login successfuled',
      accessToken: this.jwtService.sign({
        id: existUser.id,
        email: existUser.email,
        role: existUser.role,
      }),
    };
  }
}
