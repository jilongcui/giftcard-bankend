import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from '../auth.service';
import { jwtConstants } from '../auth.constants';
import { Payload } from '@app/modules/login/login.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // logger = new Logger(JwtStrategy.name)
  constructor(
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
      passReqToCallback: true,   //设置回调的第一个参数是  request
    });
  }

  async validate(request: Request, payload: Payload) {
    let { userId, pv } = payload
    let token = (request.headers as any).authorization.slice(7)
    // this.logger.debug('token ' + token)
    await this.authService.validateToken(userId, pv, token)
    // this.logger.debug('userId ' + userId)
    return { userId };  //返回值会被 守卫的  handleRequest方法 捕获
  }
}
