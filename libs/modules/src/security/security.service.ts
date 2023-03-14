import { Injectable } from '@nestjs/common';
import { AuthService } from '../system/auth/auth.service';
import { CreateSecurityDto } from './dto/create-security.dto';
import { UpdateSecurityDto } from './dto/update-security.dto';

@Injectable()
export class SecurityService {

  constructor(
    private readonly authService: AuthService
  ) {
    
  }
  create(createSecurityDto: CreateSecurityDto) {
    return 'This action adds a new security';
  }

  findAll() {
    return `This action returns all security`;
  }

  findOne(id: number) {
    return `This action returns a #${id} security`;
  }

  update(id: number, updateSecurityDto: UpdateSecurityDto) {
    return `This action updates a #${id} security`;
  }

  remove(id: number) {
    return `This action removes a #${id} security`;
  }

  checkText(openId: string, text: string) {
    return this.authService.securityCheck(openId, text)
  }
}
