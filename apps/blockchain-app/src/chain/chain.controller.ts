import { ChainService } from '@app/chain';
import { DestroyDto, MintADto, RealAuthDto, TransferDto } from '@app/chain/dto/request-chain.dto';
import { ResAddressCreateDto } from '@app/chain/dto/response-chain.dto';
import { ResAddressDto } from '@app/modules/wallet/address/dto/res-address.dto';
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';

@Controller('chain')
export class ChainController {

    constructor(
        private readonly chainService: ChainService
    ) { }

    @MessagePattern({ cmd: 'createAddress' })
    async createAccount(): Promise<ResAddressDto> {
        return await this.chainService.initAccount()
    }

    @MessagePattern({ cmd: 'realAuth' })
    async realAuth(data: RealAuthDto) {
        return await this.chainService.realAuth(data)
    }

    @MessagePattern({ cmd: 'getAccountInfo' })
    async getAccountInfo(data: string) {
        return await this.chainService.getAccountInfo(data)
    }

    @EventPattern({ cmd: 'mintA' })
    async mint(data: MintADto) {
        return await this.chainService.mintA(data)
    }

    @MessagePattern({ cmd: 'transfer' })
    async transfer(data: TransferDto) {
        return await this.chainService.transfer(data)
    }

    @MessagePattern({ cmd: 'transferCric' })
    async transferCric(data: string) {
        return await this.chainService.transferCric(data)
    }

    @MessagePattern({ cmd: 'destroy' })
    async destroy(data: DestroyDto) {
        return await this.chainService.destroy(data)
    }
}
