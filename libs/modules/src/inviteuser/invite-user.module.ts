import { Module } from '@nestjs/common';
import { InviteUserService } from './invite-user.service';
import { InviteUserController } from './invite-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteUser } from './entities/invite-user.entity';
import { User } from '@app/common/decorators/user.decorator';
import { UserModule } from '../system/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserModule
  ],
  providers: [InviteUserService],
  controllers: [InviteUserController],
  exports: [InviteUserService]
})
export class InviteUserModule { }
