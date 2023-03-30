import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { Email } from './entities/email.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../system/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Email, User]),
  ],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
