import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { ReqAddressDto } from './dto/req-address.dto';
import { ResAddressDto } from './dto/res-address.dto';
import { AddressService } from './address.service';
import { Address } from './entities/address.entity';
import { ReqAddressList } from './dto/req-address-list.dto';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { RequiresPermissions } from 'src/common/decorators/requires-permissions.decorator';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('钱包地址')
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

    @Post()
    @Public()
    addressCreate(@Body() addressCreate: ReqAddressDto): Promise<ResAddressDto> {
        return this.addressService.addressCreate(addressCreate);
    }
}
