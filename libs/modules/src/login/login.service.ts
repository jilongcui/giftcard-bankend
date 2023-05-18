/*
 * @Author: Sheng.Jiang
 * @Date: 2021-12-08 18:30:53
 * @LastEditTime: 2022-05-05 15:47:35
 * @LastEditors: Please set LastEditors
 * @Description: 登录 service
 * @FilePath: \meimei-admin\src\modules\login\login.service.ts
 * You can you up，no can no bb！！
 */


import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CAPTCHA_IMG_KEY, USER_ACCESS_TOKEN_KEY, USER_AVATAR_KEY, USER_DEPTID_KEY, USER_DEPTNAME_KEY, USER_MEMBER_ENDTIME_KEY, USER_NICKNAME_KEY, USER_OPENID_KEY, USER_PERMISSIONS_KEY, USER_ROLEKEYS_KEY, USER_ROLEKS_KEY, USER_TOKEN_KEY, USER_USERNAME_KEY, USER_VIP_KEY, USER_VERSION_KEY } from '@app/common/contants/redis.contant';
import { ApiException } from '@app/common/exceptions/api.exception';
import { SharedService } from '@app/shared/shared.service';
import { MenuService } from '../system/menu/menu.service';
import { User } from '../system/user/entities/user.entity';
import { UserService } from '../system/user/user.service';
import { ResInfo } from './dto/res-login.dto';
import { Request } from 'express';
import { LogService } from '../monitor/log/log.service';
import { ConfigService } from '@nestjs/config';
import { Captcha } from 'captcha.gif';
import { QueryInviteUserDto, ReqEmailRecoverDto, ReqEmailRegDto, ReqInnerRegDto, ReqMobileRecoverDto, ReqMobileRegDto } from './dto/req-login.dto';
import { ReqAddUserDto } from '../system/user/dto/req-user.dto';
import { isPhoneNumber } from 'class-validator';
import * as moment from 'moment'
import { InviteUserService } from '@app/modules/inviteuser/invite-user.service';
import { AuthService } from '../system/auth/auth.service';
const strRandom = require('string-random');

@Injectable()
export class LoginService {
    logger: Logger;
    constructor(
        private readonly sharedService: SharedService,
        @InjectRedis() private readonly redis: Redis,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly menuService: MenuService,
        private readonly logService: LogService,
        private readonly configService: ConfigService,
        private readonly inviteUserService: InviteUserService,
        private readonly authService: AuthService
    ) {
        this.logger = new Logger(LoginService.name)
    }

    /* 创建验证码图片 */
    async createImageCaptcha() {
        const captcha = new Captcha({
            numberOfDots: 0,
            blur: false,
            filter: false
        });
        const { token, buffer } = captcha.generate();
        const result = {
            img: buffer.toString('base64'),
            uuid: this.sharedService.generateUUID(),
        }
        // this.logger.debug("Image Code")
        // this.logger.debug(token)
        await this.redis.set(`${CAPTCHA_IMG_KEY}:${result.uuid}`, token, 'EX', 60 * 5)
        return result
    }

    /* 注册 */
    async register(reqMobileRegDto: ReqMobileRegDto |ReqEmailRegDto, request: Request) {

        const reqAddUserDto = new ReqAddUserDto()
        let user: User;
        if (reqMobileRegDto instanceof ReqMobileRegDto) {
            user = await this.userService.findOneByPhone(reqMobileRegDto.phone)
            if (user) throw new ApiException('该手机号已存在')
            reqAddUserDto.phonenumber = reqMobileRegDto.phone;
            reqAddUserDto.userName = "gf_" + strRandom(8).toLowerCase() // reqMobileRegDto.phone;
        } else if (reqMobileRegDto instanceof ReqEmailRegDto) {
            user = await this.userService.findOneByPhone(reqMobileRegDto.email)
            if (user) throw new ApiException('该邮箱已存在')
            reqAddUserDto.email = reqMobileRegDto.email;
            reqAddUserDto.userName = "gf_" + strRandom(8).toLowerCase() // reqMobileRegDto.email;
        }
        
        reqAddUserDto.nickName = '';
        reqAddUserDto.userType = '01'; // normal user.
        reqAddUserDto.postIds = [];
        reqAddUserDto.roleIds = [];

        reqAddUserDto.createBy = reqAddUserDto.updateBy = 'admin'
        await this.userService.addUser(reqAddUserDto)

        if (reqMobileRegDto instanceof ReqMobileRegDto) {
            user = await this.userService.findOneByPhone(reqMobileRegDto.phone)
        } else if (reqMobileRegDto instanceof ReqEmailRegDto) {
            user = await this.userService.findOneByEmail(reqMobileRegDto.email)
        }
        if (!user) throw new ApiException('创建用户失败')

        // Add invite relationship.
        if (reqMobileRegDto.invite !== undefined && reqMobileRegDto.invite !== '') {
            const parentUser = await this.userService.findOneByInviteCode(reqMobileRegDto.invite)
            // this.logger.debug(parentUser)
            if (!parentUser)
                throw new ApiException('邀请码不存在')
            // Check if is invited.
            const parent = await this.inviteUserService.parent(user.userId)
            if (parent) {
                throw new ApiException('已经绑定邀请码')
            }
            // Add invite relation ship.
            const inviteInfo = await this.inviteUserService.bindParent(user.userId, parentUser.userId)
            // this.logger.debug(inviteInfo)
        }

        if(reqMobileRegDto.password != undefined && reqMobileRegDto.password !== '') {
            await this.userService.setSelfPwd({newPassword: reqMobileRegDto.password} , user.userName)
        }

        const payload = { userId: user.userId, pv: 1, };
        //生成token
        let jwtSign = this.jwtService.sign(payload)
        //演示环境 复用 token，取消单点登录。
        if (this.configService.get<Boolean>('isDemoEnvironment')) {
            const token = await this.redis.get(`${USER_TOKEN_KEY}:${user.userId}`)
            if (token) {
                jwtSign = token
            }
        }
        //存储密码版本号，防止登录期间 密码被管理员更改后 还能继续登录
        await this.redis.set(`${USER_VERSION_KEY}:${user.userId}`, 1)
        //存储token, 防止重复登录问题，设置token过期时间(1天后 token 自动过期)，以及主动注销token。
        await this.redis.set(`${USER_TOKEN_KEY}:${user.userId}`, jwtSign, 'EX', 60 * 60 * 24 * 12)
        //调用存储在线用户接口
        // await this.logService.addLogininfor(request, '注册成功', `${USER_TOKEN_KEY}:${user.userId}`)
        return { token: jwtSign }
    }

    /* 注册 */
    async recoverPassword(reqMobileRecoverDto: ReqMobileRecoverDto |ReqEmailRecoverDto, request: Request) {

        let user: User;
        if (reqMobileRecoverDto instanceof ReqMobileRecoverDto) {
            user = await this.userService.findOneByPhone(reqMobileRecoverDto.phone)
            if (!user) throw new ApiException('该手机号用户不存在')
            if(reqMobileRecoverDto.password != undefined && reqMobileRecoverDto.password !== '') {
                await this.userService.recoverPwd({password: reqMobileRecoverDto.password, password2: reqMobileRecoverDto.password2} , user.userName)
            }
        } else if (reqMobileRecoverDto instanceof ReqEmailRecoverDto) {
            if(reqMobileRecoverDto.password != undefined && reqMobileRecoverDto.password !== '') {
            await this.userService.recoverPwd({password: reqMobileRecoverDto.password, password2: reqMobileRecoverDto.password2} , user.userName)
        }
            user = await this.userService.findOneByPhone(reqMobileRecoverDto.email)
            if (!user) throw new ApiException('该手机号用户不存在')
            if(reqMobileRecoverDto.password != undefined && reqMobileRecoverDto.password !== '') {
                await this.userService.recoverPwd({password: reqMobileRecoverDto.password, password2: reqMobileRecoverDto.password2} , user.userName)
            }
        }
    }

    private makeRandomPhone(): string {
        let num = '1',
            random = Math.random();
        if (random >= 0.1 && random < 0.2) {//15概率
            num += '5';
        } else if (random >= 0.05 && random < 0.1) {//18概率
            num += '8';
        } else if (random >= 0 && random < 0.05) {//17概率
            num += '7';
        } else {//13概率
            num += '3';
        }

        let numLen9 = '';
        for (let j = 0; j < 9; j++) {
            numLen9 += Math.floor(Math.random() * 10)
        }

        // 返回一个号码
        return num + numLen9;
    }

    /* 注册 */
    async innerRegister(reqInnerRegDto: ReqInnerRegDto) {
        const phone = this.makeRandomPhone();
        let user = await this.userService.findOneByPhone(phone)
        if (user) throw new ApiException('该用户名已存在')

        const reqAddUserDto = new ReqAddUserDto()
        reqAddUserDto.phonenumber = phone;
        reqAddUserDto.userName = phone;
        reqAddUserDto.nickName = '';
        reqAddUserDto.userType = '01'; // normal user.
        reqAddUserDto.postIds = [];
        reqAddUserDto.roleIds = [];

        reqAddUserDto.createBy = reqAddUserDto.updateBy = 'admin'
        await this.userService.addUser(reqAddUserDto)

        user = await this.userService.findOneByPhone(phone)
        if (!user) throw new ApiException('创建用户失败')

        // Add invite relationship.
        if (reqInnerRegDto.invite !== undefined && reqInnerRegDto.invite !== '') {
            const parentUser = await this.userService.findOneByInviteCode(reqInnerRegDto.invite)
            // this.logger.debug(parentUser)
            if (!parentUser)
                throw new ApiException('邀请码不存在')
            // Check if is invited.
            const parent = await this.inviteUserService.parent(user.userId)
            if (parent) {
                throw new ApiException('已经绑定邀请码')
            }
            // Add invite relation ship.
            const inviteInfo = await this.inviteUserService.bindParent(user.userId, parentUser.userId)
            // this.logger.debug(inviteInfo)
        }

        const payload = { userId: user.userId, pv: 1, };
        //生成token
        let jwtSign = this.jwtService.sign(payload)
        //演示环境 复用 token，取消单点登录。
        if (this.configService.get<Boolean>('isDemoEnvironment')) {
            const token = await this.redis.get(`${USER_TOKEN_KEY}:${user.userId}`)
            if (token) {
                jwtSign = token
            }
        }
        //存储密码版本号，防止登录期间 密码被管理员更改后 还能继续登录
        await this.redis.set(`${USER_VERSION_KEY}:${user.userId}`, 1)
        //存储token, 防止重复登录问题，设置token过期时间(1天后 token 自动过期)，以及主动注销token。
        await this.redis.set(`${USER_TOKEN_KEY}:${user.userId}`, jwtSign, 'EX', 60 * 60 * 24 * 12)
        //调用存储在线用户接口
        // await this.logService.addLogininfor(request, '注册成功', `${USER_TOKEN_KEY}:${user.userId}`)
        return { token: jwtSign }
    }


    /* 登录 */
    async login(request: Request) {
        const { user } = request as any
        const payload = { userId: user.userId, pv: 1, };
        //生成token
        let jwtSign = this.jwtService.sign(payload)
        //演示环境 复用 token，取消单点登录。
        if (this.configService.get<Boolean>('isDemoEnvironment')) {
            const token = await this.redis.get(`${USER_TOKEN_KEY}:${user.userId}`)
            if (token) {
                jwtSign = token
            }
        }

        //存储密码版本号，防止登录期间 密码被管理员更改后 还能继续登录
        await this.redis.set(`${USER_VERSION_KEY}:${user.userId}`, 1)
        //存储token, 防止重复登录问题，设置token过期时间(1天后 token 自动过期)，以及主动注销token。
        await this.redis.set(`${USER_TOKEN_KEY}:${user.userId}`, jwtSign, 'EX', 60 * 60 * 24 * 12)
        //调用存储在线用户接口
        await this.logService.addLogininfor(request, '登录成功', `${USER_TOKEN_KEY}:${user.userId}`)
        return { token: jwtSign, openId: user.openId }
    }

    /* 退出登录 */
    async logout(token: string) {
        try {
            const payload = this.jwtService.verify(token)
            if (await this.redis.get(`${USER_TOKEN_KEY}:${payload.userId}`)) {
                await this.redis.del(`${USER_TOKEN_KEY}:${payload.userId}`)
            }
        } catch (error) { }
    }

    /* 获取用户信息 */
    async getInfo(userId: number): Promise<ResInfo> {
        // this.logger.debug('userId ' + userId)
        let user: User = await this.userService.findOneUserAllById(userId)
        if (!user) throw new ApiException("用户信息已被修改", 401)
        // this.logger.debug('user ' + user)
        const deptId = user.dept ? user.dept.deptId : ''
        const deptName = user.dept ? user.dept.deptName : ''
        let roleKeyArr: string[] = user.roles.map(role => role.roleKey)
        let permissions = []
        if (!roleKeyArr.length) {
            permissions = []
        } else {
            if (roleKeyArr.find(roleKey => roleKey == 'admin')) {
                permissions = ["*:*:*"]
            } else {
                const roleIdArr = user.roles.map(role => role.roleId)
                permissions = await this.menuService.getAllPermissionsByRoles(roleIdArr)
            }
        }
        let endTime: moment.Moment
        if (!user.member || !user.member.endTime) {
            endTime = moment()
        } else {
            endTime = moment(user.member.endTime)
        }
        /* 将用户信息、权限数组、角色数组 存放进入缓存 */
        const promiseArr = [
            this.redis.set(`${USER_USERNAME_KEY}:${userId}`, user.userName),
            this.redis.set(`${USER_VIP_KEY}:${userId}`, user.vip),
            this.redis.set(`${USER_NICKNAME_KEY}:${userId}`, user.nickName),
            this.redis.set(`${USER_DEPTID_KEY}:${userId}`, deptId),
            this.redis.set(`${USER_DEPTNAME_KEY}:${userId}`, deptName),
            this.redis.set(`${USER_AVATAR_KEY}:${userId}`, user.avatar),
            this.redis.set(`${USER_OPENID_KEY}:${userId}`, user.openId),
            this.redis.set(`${USER_MEMBER_ENDTIME_KEY}:${userId}`, endTime.format('YYYY-MM-DD HH:mm:ss')),
            this.redis.set(`${USER_PERMISSIONS_KEY}:${userId}`, JSON.stringify(permissions)),
            this.redis.set(`${USER_ROLEKEYS_KEY}:${userId}`, JSON.stringify(roleKeyArr)),
            this.redis.set(`${USER_ROLEKS_KEY}:${userId}`, JSON.stringify(user.roles)),
        ]
        await Promise.all(promiseArr)
        return {
            permissions,
            roles: roleKeyArr,
            user,
        }
    }


    /* 获取当前用户的菜单 */
    async getRouterByUser(userId: number) {
        let user: User = await this.userService.findOneUserAllById(userId)
        const isAdmin = user.roles.some(role => role.roleKey === 'admin')
        const roleIdArr = user.roles.map(role => role.roleId)
        if (!isAdmin && !roleIdArr.length) return []
        return await this.menuService.getMenuList(isAdmin, roleIdArr)
    }
}
