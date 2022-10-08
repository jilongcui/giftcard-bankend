import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submitter } from './entities/submitter.entity';
import { SubmitterService } from './submitter.service';

@Module({
  imports: [TypeOrmModule.forFeature([Submitter])],
  providers: [SubmitterService],
  exports: [SubmitterService]
})
export class SubmitterModule { }
