import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityGateway } from './security.gateway';
import { AuthService } from '../system/auth/auth.service';
import { SecurityController } from './security.controller';

@Module({
  imports: [
    AuthService
  ],
  providers: [SecurityController, SecurityGateway, SecurityService],
  exports: [SecurityService]
})
export class SecurityModule {}
