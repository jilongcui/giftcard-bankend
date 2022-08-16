import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Public } from '@app/common/decorators/public.decorator';
import { ReqAddressCreateDto, ReqAddressList } from './dto/req-address.dto';
import { ResAddressDto } from './dto/res-address.dto';
import { AddressService } from './address.service';
import { Address } from './entities/address.entity';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('钱包地址')
@Controller('wallet/address')
export class AddressController {
    constructor(private readonly addressService: AddressService,
    ) { }

    // @RequiresPermissions('system:address:query')
    @Get('list')
    @Public()
    @ApiPaginatedResponse(Address)
    list(@Query(PaginationPipe) reqAddressList: ReqAddressList) {
        return this.addressService.list(reqAddressList)
    }

    @Post()
    @Public()
    addressCreate(@Body() addressCreate: ReqAddressCreateDto): Promise<ResAddressDto> {
        return this.addressService.addressCreate(addressCreate);
    }
}
