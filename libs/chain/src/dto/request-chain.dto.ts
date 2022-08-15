
export class RealAuthDto {
    hexAddress: string;
    userName: string;
    userCardId: string
}

export class MintDto {
    contractId: number;
    address: string;
    tokenId: string;
    url: string;
}

export class TransferDto {
    contractId: number;
    address: string;
    tokenId: string
}

export class DestroyDto {
    contractId: number;
    tokenId: string
}