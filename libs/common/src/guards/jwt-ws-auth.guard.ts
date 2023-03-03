import { Payload } from '@app/modules/login/login.interface';
import { AuthService } from '@app/modules/system/auth/auth.service';
import { UserService } from '@app/modules/system/user/user.service';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';
import Redis from 'ioredis';
import { Observable } from 'rxjs';
import { PUBLIC_KEY } from '../contants/decorator.contant';
import { USER_TOKEN_KEY, USER_VERSION_KEY } from '../contants/redis.contant';
import { ApiException } from '../exceptions/api.exception';

@Injectable()
// export class JwtWsAuthGuard extends AuthGuard('jwt-ws') {
export class JwtWsAuthGuard implements CanActivate {
    logger: Logger
    constructor(
        private readonly jwtService: JwtService,
        @InjectRedis() private readonly redis: Redis,
        private reflector: Reflector,
        ) {
        this.logger = new Logger(JwtWsAuthGuard.name)
    }
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        // getHandler 值将覆盖 getClass上面的值
        const noInterception = this.reflector.getAllAndOverride(PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ])
        if (noInterception) return true

        try {
            const handshake = context.switchToWs().getClient().handshake
            return this.validate(context, handshake)
        } catch (error) {
            return false
        }
    }
    
    async validate(context: ExecutionContext, handshake: any) {
        let token = handshake.auth.token
        const { userId, pv } = await this.jwtService.verify(token)
        await this.validateToken(userId, pv, token)
        const data = context.switchToWs().getClient()
        data.user = {userId}
        // if (!data.user) {
        //     data.user = await this.userService.findById(userId)
        // }

        return  true;  //返回值会被 守卫的  handleRequest方法 捕获
      }

    async validateToken(userId: number, pv: number, restoken: string) {
        const token = await this.redis.get(`${USER_TOKEN_KEY}:${userId}`)
        if (restoken !== token) throw new WsException("登录状态已过期")
        const passwordVersion = parseInt(await this.redis.get(`${USER_VERSION_KEY}:${userId}`))
        if (pv !== passwordVersion) throw new WsException("用户信息已被修改")
    }
}
