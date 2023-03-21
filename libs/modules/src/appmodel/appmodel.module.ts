import { Module } from '@nestjs/common';
import { AppmodelService } from './appmodel.service';
import { AppmodelController } from './appmodel.controller';
import { Appmodel } from './entities/appmodel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appmodel])
  ],
  controllers: [AppmodelController],
  providers: [AppmodelService]
})
export class AppmodelModule {}
