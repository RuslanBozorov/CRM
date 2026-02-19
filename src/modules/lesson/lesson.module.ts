import { Module } from '@nestjs/common';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[AuthModule],
  controllers: [LessonController],
  providers: [LessonService]
})
export class LessonModule {}
