import { ChainService } from '@app/chain';
import { DestroyDto, MintDto, RealAuthDto, TransferDto } from '@app/chain/dto/request-chain.dto';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller('chain')
export class ChainController {

    constructor(
        private readonly chainService: ChainService
    ) { }

    @MessagePattern({ cmd: 'createAccount' })
    async createAccount() {
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

    @MessagePattern({ cmd: 'mint' })
    async mint(data: MintDto) {
        return await this.chainService.mint(data)
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
