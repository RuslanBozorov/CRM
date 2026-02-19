import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

import { AuthModule } from '../auth/auth.module';

@Module({
  // ================= Run Prettier to format the code =================
  imports: [AuthModule],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
