import { Module } from '@nestjs/common';
import { VersionService } from './version.service';
import { VersionController } from './version.controller';
import { Version } from './entities/version.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Version]),],
  controllers: [VersionController],
  providers: [VersionService],
  exports: [VersionService]
})
export class VersionModule {}
