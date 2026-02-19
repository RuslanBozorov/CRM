import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { StudentGroupModule } from './student-group/student-group.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  // ================= Run Prettier to format the code =================
  controllers: [GroupsController],
  providers: [GroupsService],
  imports: [StudentGroupModule, AuthModule],
})
export class GroupsModule {}
