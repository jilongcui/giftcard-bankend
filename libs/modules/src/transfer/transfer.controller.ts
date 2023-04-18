import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Transfer } from './entities/transfer.entity';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { ReqTransferListDto } from './dto/create-transfer.dto';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';

@ApiTags('内部转币')
@ApiBearerAuth()
@Controller('transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}
  @Get('list')
    @Public()
    @ApiPaginatedResponse(Transfer)
    async list(@Query() reqTransferListDto: ReqTransferListDto) {
        return this.transferService.list(reqTransferListDto);
    }

    @Get('mylist')
    @ApiPaginatedResponse(Transfer)
    async mylist(@Query() reqTransferListDto: ReqTransferListDto, @UserDec(UserEnum.userId) userId: number) {
        return this.transferService.mylist(reqTransferListDto, userId);
    }

}
