import { PartialType } from '@nestjs/swagger';
import { CreateKycDto } from './create-kyc.dto';
import { IsString } from 'class-validator';

export class UpdateKycDto extends PartialType(CreateKycDto) {}

export class UpdateKycStatusDto {
    /* KYC 状态 0: "未认证", 1: "认证成功", 2: "认证失败" */
    @IsString()
    status: string
}

export class NotifyKycStatusDto {

    @IsString()
    orderNo: string

    /* KYC 状态 0: "未认证", 1: "认证成功", 2: "认证失败" */
    @IsString()
    status: string
}
