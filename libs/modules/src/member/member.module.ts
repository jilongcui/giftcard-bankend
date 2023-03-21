import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { MemberInfo } from './entities/member-info.entity';
import { MemberInfoService } from './member-info.service';
import { MemberInfoController } from './member-info.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, MemberInfo])],
  controllers: [MemberController, MemberInfoController],
  providers: [MemberService, MemberInfoService],
  exports: [MemberService, MemberInfoService],
})
export class MemberModule {}
