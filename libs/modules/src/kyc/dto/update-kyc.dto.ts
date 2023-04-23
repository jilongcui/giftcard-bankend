import { PartialType } from '@nestjs/swagger';
import { CreateKycDto } from './create-kyc.dto';

export class UpdateKycDto extends PartialType(CreateKycDto) {}

export class UpdateKycStatusDto {
    /* KYC 状态 0: "未认证", 1: "认证成功", 2: "认证失败" */
    status: string
}
