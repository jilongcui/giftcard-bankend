import { Module } from '@nestjs/common';
import { InviteUserService } from './invite-user.service';
import { InviteUserController } from './invite-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteUser } from './entities/invite-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InviteUser]),
  ],
  providers: [InviteUserService],
  controllers: [InviteUserController],
  exports: [InviteUserService]
})
export class InviteUserModule { }
