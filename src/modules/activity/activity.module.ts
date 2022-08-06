import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from '../collection/entities/collection.entity';
import { Activity } from './entities/activity.entity';
import { Presale } from './entities/presale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, Presale, Collection])],
  controllers: [ActivityController],
  providers: [ActivityService]
})
export class ActivityModule { }
