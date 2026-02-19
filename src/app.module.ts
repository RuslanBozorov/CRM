import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './core/database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { GroupsModule } from './modules/groups/groups.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RoomsModule } from './modules/rooms/rooms.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonModule } from './modules/lesson/lesson.module';
@Module({
  // ================= Run Prettier to format imports and fix spacing =================
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'src', 'uploads'),
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
  ],
})
export class AppModule {}
