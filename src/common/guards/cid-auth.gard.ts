import { InjectRedis, Redis } from "@nestjs-modules/ioredis";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { USER_CID_KEY } from "../contants/redis.contant";

@Injectable()
class CIdAuthGuard implements CanActivate {

    constructor(@InjectRedis() private readonly redis: Redis) {

    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const userId = request.user?.userId
        const cIdString = JSON.parse(await this.redis.get(`${USER_CID_KEY}:${userId}`))
        if (cIdString && cIdString.length() > 10)
            return true;
        return false;
    }

}