import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateKycDto } from './create-kyc.dto';
import { IsOptional, IsString } from 'class-validator';
import { KycCertifyInfo } from '../entities/kyc.entity';

export class UpdateKycDto extends PartialType(CreateKycDto) {}

export class UpdateKycStatusDto {
    /* KYC 状态 0: "未认证", 1: "认证成功", 2: "认证失败" */
    @IsString()
    status: string
}

export class UpdateKycCardNoDto {
    @IsString()
    merOrderNo: string

    @IsString()
    cardNo: string
}

export class NotifyKycStatusDto {
    @IsString()
    orderNo: string

    @IsString()
    merOrderNo: string

    @IsString()
    status: string

    @IsString()
    @IsOptional()
    cardNumber?: string

    @IsString()
    @IsOptional()
    failReason?: string
}

