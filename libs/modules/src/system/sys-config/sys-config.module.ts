import { SysConfigService } from './sys-config.service';
import { SysConfigController } from './sys-config.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysConfig } from './entities/sys-config.entity';
import { ConfigController } from './config.controller';

@Module({
    imports: [TypeOrmModule.forFeature([SysConfig])],
    controllers: [
        SysConfigController, ConfigController],
    providers: [
        SysConfigService,],
    exports: [
        SysConfigService
    ]
})
export class SysConfigModule { }
