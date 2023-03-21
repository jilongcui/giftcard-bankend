import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { Logger, UseFilters, UseGuards, WsExceptionFilter, MessageEvent } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { SecurityService } from './security.service';
import {} from '@nestjs/platform-socket.io'
import { JwtWsAuthGuard } from '@app/common/guards/jwt-ws-auth.guard';
import { AllWsExceptionsFilter } from '@app/common/filters/all-ws-exception.filter';
import { UserInfoPipe } from '@app/common/pipes/user-info.pipe';
import { MemberAuthGuard } from '@app/common/guards/member-auth.guard';
import { from, map, Observable } from 'rxjs';
import { CheckSecurityDto } from './dto/create-security.dto';
import { checkServerIdentity } from 'tls';

@UseFilters(new AllWsExceptionsFilter())
@UseGuards(JwtWsAuthGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SecurityGateway implements OnGatewayConnection<WebSocket>, OnGatewayDisconnect<WebSocket> {

  logger = new Logger(SecurityGateway.name)
  constructor(private readonly securityService: SecurityService) {}

  handleConnection(client: any, ...args: any[]): any {
  }

  handleDisconnect(client: WebSocket): any {
  }

  @SubscribeMessage('check')
  async prompt(@MessageBody() checkSecurityDto: CheckSecurityDto, @UserDec(UserEnum.openId, UserInfoPipe) openId: string) {
    const result = await this.securityService.checkText(openId, checkSecurityDto.text);
    return result
  }

  
}
