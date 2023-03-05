import { Module } from '@nestjs/common';
import { DialogService } from './dialog.service';
import { DialogGateway } from './dialog.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dialog } from './entities/dialog.entity';
import { Nano } from '../nano/entities/nano.entity';
import { NanoModule } from '../nano/nano.module';
import { EngineModule } from '../engine/engine.module';
import { SharedModule } from '@app/shared';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../system/auth/auth.constants';
import { UserModule } from '../system/user/user.module';
import { DialogController } from './dialog.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dialog, Nano]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '168h' },
  }),
    NanoModule, EngineModule, SharedModule, UserModule
  ],
  controllers: [DialogController],
  providers: [DialogGateway, DialogService],
  exports: [DialogService]
})
export class DialogModule {}
