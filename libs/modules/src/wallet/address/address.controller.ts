import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Public } from '@app/common/decorators/public.decorator';
import { ReqAddressCreateDto, ReqAddressList, ReqBindAddressDto } from './dto/req-address.dto';
import { ResAddressDto } from './dto/res-address.dto';
import { AddressService } from './address.service';
import { Address } from './entities/address.entity';
import { User as UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('钱包地址')
@ApiBearerAuth()
@Controller('wallet/address')
export class AddressController {
    constructor(private readonly addressService: AddressService,
    ) { }

    // @RequiresPermissions('system:address:query')

    @Get()
    @Public()
    @ApiPaginatedResponse(Address)
    list(@Query(PaginationPipe) reqAddressList: ReqAddressList) {
        return this.addressService.list(reqAddressList)
    }

    @Get('list')
    @Public()
    @ApiPaginatedResponse(Address)
    list2(@Query(PaginationPipe) reqAddressList: ReqAddressList) {
        return this.addressService.list(reqAddressList)
    }

    @Get('my')
    myAddr(@UserDec(UserEnum.userId) userId: number) {
        return this.addressService.findOne(userId)
    }

    @Post()
    @Public()
    addressCreate(@Body() addressCreate: ReqAddressCreateDto): Promise<ResAddressDto> {
        return this.addressService.addressCreate(addressCreate);
    }

    @Post('bind/crichain')
    async bindWithCrichain(@Body() reqBindAddress: ReqBindAddressDto, @UserDec(UserEnum.userId) userId: number) {
        return this.addressService.bindWithCrichain(reqBindAddress.address, userId);
    }
}

