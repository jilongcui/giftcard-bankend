
export class RealAuthDto {
    hexAddress: string;
    userName: string;
    userCardId: string
}

export class MintADto {
    contractId: number;
    address: string;
    tokenId: string;
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