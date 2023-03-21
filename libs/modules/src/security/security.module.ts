import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityGateway } from './security.gateway';
import { SecurityController } from './security.controller';
import { AuthModule } from '../system/auth/auth.module';
import { SharedModule } from '@app/shared';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../system/auth/auth.constants';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '168h' },
    }),
    SharedModule,
    AuthModule,
  ],
  controllers: [SecurityController],
  providers: [SecurityGateway, SecurityService],
  exports: [SecurityService]
})
export class SecurityModule {}
