import { PartialType, PickType } from '@nestjs/swagger';
import { CreatePromotionAgentDto } from './create-promotion_agent.dto';

export class UpdatePromotionAgentDto extends PartialType(CreatePromotionAgentDto) {}

export class UpdatePromotionAgentStatusDto extends PickType(CreatePromotionAgentDto, ['status']) {}
