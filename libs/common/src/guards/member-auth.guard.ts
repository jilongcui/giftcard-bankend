/*
 * @Author: Sheng.Jiang
 * @Date: 2021-12-22 13:22:00
 * @LastEditTime: 2021-12-22 13:58:41
 * @LastEditors: Sheng.Jiang
 * @Description: 权限守卫
 * @FilePath: \meimei\src\common\guards\role-auth.guard copy.ts
 * You can you up，no can no bb！！
 */


import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_MEMBER_ENDTIME_KEY, USER_ROLEKEYS_KEY } from '../contants/redis.contant';
import * as moment from 'moment';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class MemberAuthGuard implements CanActivate {
    logger = new Logger(MemberAuthGuard.name)
  constructor(
    private reflector: Reflector,
    @InjectRedis() private readonly redis: Redis
  ) { }
  async canActivate(
    context: ExecutionContext,
  ) {
    let userId: number
    if(context.getType() === 'http') {
        const request = context.switchToHttp().getRequest()
        userId = request.user?.userId
        
    } else if (context.getType() === 'ws') {
        const client = context.switchToWs().getClient()
        userId = client.user?.userId
    } else if (context.getType() === 'rpc') {
        const client = context.switchToRpc().getContext()
        userId = client.user?.userId
    } 

    const endTime = await this.redis.get(`${USER_MEMBER_ENDTIME_KEY}:${userId}`)
    const invalidMember = moment(endTime).isBefore(moment(moment.now()))
    if (invalidMember) throw new WsException('会员已到期')
    
    return true
  }
}
