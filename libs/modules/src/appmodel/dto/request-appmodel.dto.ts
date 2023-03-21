import { CreateCompletionRequestDto } from "@app/modules/engine/dto/create-engine.dto";
import { OmitType, PartialType } from "@nestjs/swagger";
import { Appmodel } from "../entities/appmodel.entity";

export class CreateAppmodelDto extends OmitType(Appmodel, ['id', 'createTime'] as const) { }
export class UpdateAllAppmodelDto extends Appmodel { }
export class UpdateAppmodelDto extends PartialType(CreateAppmodelDto) { }
export class ListAppmodelDto extends PartialType(OmitType(Appmodel,['preset'])) {
 }