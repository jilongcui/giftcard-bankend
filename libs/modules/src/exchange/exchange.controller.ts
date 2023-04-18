import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Exchange } from './entities/exchange.entity';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { ReqExchangeListDto } from './dto/create-exchange.dto';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';

@ApiTags('币币兑换')
@ApiBearerAuth()
@Controller('exchange')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}
  @Get('list')
    @Public()
    @ApiPaginatedResponse(Exchange)
    async list(@Query() reqExchangeListDto: ReqExchangeListDto) {
        return this.exchangeService.list(reqExchangeListDto);
    }

    @Get('mylist')
    @ApiPaginatedResponse(Exchange)
    async mylist(@Query() reqExchangeListDto: ReqExchangeListDto, @UserDec(UserEnum.userId) userId: number) {
        return this.exchangeService.mylist(reqExchangeListDto, userId);
    }

}
