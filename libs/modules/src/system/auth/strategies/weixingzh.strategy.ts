import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class WeixinGzhStrategy extends PassportStrategy(Strategy, 'weixingzh') {
    constructor(
        private readonly authService: AuthService) {
        super(
            {
                usernameField: 'phone',
                passwordField: 'code',
                passReqToCallback: true,   //设置回调函数第一个参数为 request
            }
        );
    }

    async validate(request, phone: string, code: string): Promise<any> {
        let user: any;
        if (code) {
            user = await this.authService.validateWeixinGzh(code)
        }

        return user   //返回值会被 守卫的  handleRequest方法 捕获
    }
}
