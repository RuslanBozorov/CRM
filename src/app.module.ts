import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './core/database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { GroupsModule } from './modules/groups/groups.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { RoomsModule } from './modules/rooms/rooms.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { HomeworkModule } from './modules/homework/homework.module';
import { UPLOADS_DIR } from './common/utils/storage-paths';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: UPLOADS_DIR,
      serveRoot: '/files',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
    RoomsModule,
    CoursesModule,
    GroupsModule,
    LessonModule,
    AttendanceModule,
    HomeworkModule,
  ],
})
export class AppModule {}
