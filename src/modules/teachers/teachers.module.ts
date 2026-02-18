import { Module } from '@nestjs/common';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { PrismaModule } from 'src/core/database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from 'src/common/email/email.module';

@Module({
  imports: [AuthModule, EmailModule],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}
