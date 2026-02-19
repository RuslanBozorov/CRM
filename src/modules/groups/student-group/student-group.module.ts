import { Module } from '@nestjs/common';
import { StudentGroupController } from './student-group.controller';
import { StudentGroupService } from './student-group.service';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  // ================= Run Prettier to format the code =================
  imports: [AuthModule],
  controllers: [StudentGroupController],
  providers: [StudentGroupService],
})
export class StudentGroupModule {}
