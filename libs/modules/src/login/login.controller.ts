/*
 * @Author: Sheng.Jiang
 * @Date: 2021-12-08 18:30:39
 * @LastEditTime: 2022-01-19 14:18:00
 * @LastEditors: Sheng.Jiang
 * @Description: 登录 controller
 * @FilePath: \meimei-admin\src\modules\login\login.controller.ts
 * You can you up，no can no bb！！
 */

import { Body, Controller, Get, Post, Req, UseGuards, Headers, Query, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DataObj } from '@app/common/class/data-obj.class';
import { ApiDataResponse, typeEnum } from '@app/common/decorators/api-data-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { User, UserEnum } from '@app/common/decorators/user.decorator';
import { LocalAuthGuard } from '@app/common/guards/local-auth.guard';
import { Router } from '../system/menu/dto/res-menu.dto';
import { QueryInviteUserDto, ReqInnerRegDto, ReqLoginDto, ReqMobileLoginDto, ReqMobileRegDto } from './dto/req-login.dto';
import { ResImageCaptchaDto, ResLoginDto } from './dto/res-login.dto';
import { LoginService } from './login.service';
import { Request } from 'express';
import { SmsCodeGuard } from '@app/common/guards/sms-code.guard';
import { MobileAuthGuard } from '@app/common/guards/mobile-auth.guard';
import { ImageCaptchaGuard } from '@app/common/guards/image-captcha.guard';
import { SharedService } from '@app/shared/shared.service';
import { ApiException } from '@app/common/exceptions/api.exception';
import { ThrottlerBehindProxyGuard } from '@app/common/guards/throttler-behind-proxy.guard';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
@ApiTags('登录')
@ApiBearerAuth()
@UseGuards(ThrottlerBehindProxyGuard)
@Controller()
export class LoginController {
    logger: Logger;
    constructor(
        private readonly loginService: LoginService,
        private readonly sharedService: SharedService
    ) {
        this.logger = new Logger(LoginController.name)
    }

    /* 获取图片验证码 */
    @Get('captchaImage')
    @Public()
    async captchaImage(): Promise<ResImageCaptchaDto> {
        return await this.loginService.createImageCaptcha()
    }

    /* 用户密码登录 */
    @Post('login')
    @Public()
    // @UseGuards(ImageCaptchaGuard, LocalAuthGuard)
    @UseGuards(LocalAuthGuard)
    async login(@Body() reqLoginDto: ReqLoginDto, @Req() req: Request): Promise<ResLoginDto> {
        // Todo: forTest
        // if (!await this.sharedService.checkImageCaptcha(reqLoginDto.uuid, reqLoginDto.code))
        //     throw new ApiException('图形验证码错误')
        return await this.loginService.login(req)
    }

    /* 用户手机登录 */
    @Post('mlogin')
    @Public()
    @UseGuards(SmsCodeGuard, MobileAuthGuard)
    async mlogin(@Body() reqLoginDto: ReqMobileLoginDto, @Req() req: Request): Promise<ResLoginDto> {
        return await this.loginService.login(req)
    }

    /* 用户手机注册 */
    @Post('mregister')
    @Public()
    @UseGuards(SmsCodeGuard)
    async register(@Body() reqRegDto: ReqMobileRegDto, @Req() req: Request): Promise<ResLoginDto> {
        return await this.loginService.register(reqRegDto, req)
    }

    @Post('iregister')
    @Public()
    @RequiresRoles(['admin', 'system'])
    async innerRegister(@Body() reqRegDto: ReqInnerRegDto, @Req() req: Request): Promise<ResLoginDto> {
        return await this.loginService.innerRegister(reqRegDto)
    }

    /* 获取用户信息 */
    @Get('getInfo')
    async getInfo(@User(UserEnum.userId) userId: number) {
        return await this.loginService.getInfo(userId)
    }

    /* 获取用户路由信息 */
    @Get('getRouters')
    @ApiDataResponse(typeEnum.objectArr, Router)
    async getRouters(@User(UserEnum.userId) userId: number) {
        const router = await this.loginService.getRouterByUser(userId)
        return router
    }

    /* 退出登录 */
    @Public()
    @Post('logout')
    async logout(@Headers('Authorization') authorization: string) {
        if (authorization) {
            const token = authorization.slice(7)
            await this.loginService.logout(token)
        }
    }
}
