import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import * as crichain from 'crichain';
var crichain = require('crichain');
// import * as crichain from '@app/crichain';
import { DestroyDto, MintADto, RealAuthDto, TransferDto } from './dto/request-chain.dto';

@Injectable()
export class ChainService {
    logger = new Logger(ChainService.name)
    tokenUrl: string
    contractAddr: string
    platformPrivateKey: string
    constructor(
        private readonly configService: ConfigService,
    ) {
        crichain.Config.init({
            baseUrl: "http://test.open-api.crichain.cn",
            // baseUrl: "http://localhost:3001",
            contract: { path: "../../contracts/abi/NFT_A.json", code: "NFT_A" }
        });
        this.tokenUrl = this.configService.get<string>('crichain.tokenUrl')
        this.contractAddr = this.configService.get<string>('crichain.contractAddr')
        this.platformPrivateKey = this.configService.get<string>('crichain.platformPrivateKey')
    }

    // 初始化账户
    // 我们需要把账户的信息保存在系统里的account
    async initAccount() {
        let kpA = crichain.Account.genKeypair()
        // this.logger.debug(kpA)
        return { address: kpA.address, privatekeyEncode: kpA.hexPrikey }
    }

    // 通过私钥，解码出地址
    async decodePrivate(privateKey?: string) {
        // 解析发行商私钥
        // 0x8fa5914ae97735b19d5cfaac0bf4e04ab55a4dab
        if (!privateKey) {
            privateKey = this.platformPrivateKey
        }
        let kp = crichain.Account.genFromPrikey(privateKey);
        // this.logger.debug(kp)
        return kp
    }

    // 实名认证
    async realAuth(realAuthDto: RealAuthDto) {
        let result = await crichain.Account.realauth(realAuthDto.hexAddress, realAuthDto.userName, realAuthDto.userCardId);
        // console.log("realauth", result1);
        return result
    }

    // 获得用户信息
    async getAccountInfo(address: string) {
        let account = await crichain.Account.getAccountInfo(address);
        console.log("account", account);
        return account
    }

    // 铸造NFT
    // 提供tokenId
    async mintA(mintDto: MintADto) {
        // Create a transaction record
        // Do the transaction.
        // Check the transaction.
        const kp = await this.decodePrivate()
        const url = this.tokenUrl + mintDto.tokenId
        let result = await crichain.Contract.safeMint(kp, this.contractAddr, mintDto.address, mintDto.tokenId, url);
        // console.log("safeMint", result);
        // safeMint {
        //     retCode: 1,
        //     hash: '0x6b530f984225fd37b9d24dcf7922123f880427278b68c00c076b1da1cd3bc538'
        //   }
        return result
    }

    // 转移所有权
    async transfer(tansferDto: TransferDto) {
        const kp = await this.decodePrivate()
        let result3 = await crichain.Contract.safeTransfer(kp, this.contractAddr, tansferDto.address, tansferDto.tokenId);
        console.log("safeTransfer", result3);
    }

    // 转账CRIC
    async transferCric(address: string) {
        const kp = await this.decodePrivate()
        let result4 = await crichain.Account.transferCric(kp, address, "0.1");
        console.log("transferCric", result4);
    }

    // 销毁NFT
    async destroy(destroyDto: DestroyDto) {
        const kp = await this.decodePrivate()
        let result5 = await crichain.Contract.burn(kp, this.contractAddr, destroyDto.tokenId);
        console.log("burn", result5);
    }
}
