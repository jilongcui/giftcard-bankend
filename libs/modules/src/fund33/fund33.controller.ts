import { Controller, Get, Post, Body, Patch, Param, Delete, CacheInterceptor, UseInterceptors, CacheTTL } from '@nestjs/common';
import { Fund33Service } from './fund33.service';
import { CreateFund33Dto, LoginCardDto, QueryBalanceDto, QueryRechargeDto } from './dto/create-fund33.dto';
import { UpdateFund33Dto } from './dto/update-fund33.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';

@ApiTags('33金融银行卡接口')
@ApiBearerAuth()
@UseInterceptors(CacheInterceptor)
@Controller('fund33')
export class Fund33Controller {
  constructor(private readonly fund33Service: Fund33Service) {}
  // @Get()
  // findAll() {
  //   return this.fund33Service.findAll();
  // }

  @Post('login')
  loginCard(@Body() loginCardDto: LoginCardDto, @UserDec(UserEnum.userId) userId: number) {
    return this.fund33Service.loginCard(loginCardDto, userId)
  }

  @Post('queryBalance')
  @CacheTTL(60)
  queryBalance(@Body() queryBalanceDto: QueryBalanceDto, @UserDec(UserEnum.userId) userId: number) {
    return this.fund33Service.queryBalance(queryBalanceDto, userId)
  }

  @Post('recharge')
  recharge(@Body() queryRechargeDto: QueryRechargeDto, @UserDec(UserEnum.userId) userId: number) {
    return this.fund33Service.recharge(queryRechargeDto, userId)
  }
}
