
export class RealAuthDto {
    hexAddress: string;
    userName: string;
    userCardId: string
}

export class MintADto {
    contractId: number;
    contractAddr: string;
    address: string;
    tokenId: string;
}

export class TransferDto {
    contractId: number;
    contractAddr: string;
    address: string;
    tokenId: string
}

export class DestroyDto {
    contractId: number;
    contractAddr: string;
    tokenId: string
}