import { Injectable, Logger } from '@nestjs/common';
// import * as crichain from 'crichain';
var crichain = require('crichain');
// import * as crichain from '@app/crichain';
import { DestroyDto, MintDto, RealAuthDto, TransferDto } from './dto/request-chain.dto';

@Injectable()
export class ChainService {
    logger = new Logger(ChainService.name)
    constructor() {
        crichain.Config.init({
            baseUrl: "http://test.open-api.crichain.cn",
            // baseUrl: "http://localhost:3001",
            contract: { path: "../../contracts/abi/NFT_A.json", code: "NFT_A" }
        });
    }

    // 初始化账户
    // 我们需要把账户的信息保存在系统里的account
    async initAccount() {
        let kpA = crichain.Account.genKeypair()
        // this.logger.debug(kpA)
        return { address: kpA.address, privatekeyEncode: kpA.hexPrikey }
    }

    // 通过私钥，解码出地址
    async decodePrivate() {
        // 解析发行商私钥
        // 0x8fa5914ae97735b19d5cfaac0bf4e04ab55a4dab
        let kp = crichain.Account.genFromPrikey("e6779259efd057970aa83ea5cc9db62d72695ce95de9cb117c8b635418605e5d");
        // this.logger.debug(kp)
        return kp
    }

    // 实名认证
    async realAuth(realAuthDto: RealAuthDto) {
        let result1 = await crichain.Account.realauth(realAuthDto.hexAddress, realAuthDto.userName, realAuthDto.userCardId);
        console.log("realauth", result1);
        return result1
    }

    // 获得用户信息
    async getAccountInfo(address: string) {
        let account = await crichain.Account.getAccountInfo(address);
        console.log("account", account);
        return account
    }

    // 铸造NFT
    async mint(mintDto: MintDto) {
        const kp = {}
        const contractAddr = '';
        let result2 = await crichain.Contract.safeMint(kp, contractAddr, mintDto.address, mintDto.tokenId, mintDto.url);
        console.log("safeMint", result2);
    }

    // 转移所有权
    async transfer(tansferDto: TransferDto) {
        const kp = {}
        const contractAddr = '';
        let result3 = await crichain.Contract.safeTransfer(kp, contractAddr, tansferDto.address, tansferDto.tokenId);
        console.log("safeTransfer", result3);
    }

    // 转账CRIC
    async transferCric(address: string) {
        const kp = {}
        let result4 = await crichain.Account.transferCric(kp, address, "0.1");
        console.log("transferCric", result4);
    }

    // 销毁NFT
    async destroy(destroyDto: DestroyDto) {
        const kp = {}
        const contractAddr = '';
        let result5 = await crichain.Contract.burn(kp, contractAddr, destroyDto.tokenId);
        console.log("burn", result5);
    }
}
