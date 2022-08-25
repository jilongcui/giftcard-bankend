import { Module } from '@nestjs/common';
import { InviteUserService } from './invite-user.service';
import { InviteUserController } from './invite-user.controller';

@Module({
  providers: [InviteUserService],
  controllers: [InviteUserController],
  exports: [InviteUserService]
})
export class InviteUserModule { }
