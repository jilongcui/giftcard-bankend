import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Repository, FindOptionsWhere, MoreThanOrEqual } from 'typeorm';
import { CreateAccountFlowDto, ExhangeAccountFlowDto, ListAccountFlowDto, ListMyAccountFlowDto, TransferAccountFlowDto, UpdateAccountFlowDto, UpdateAllAccountFlowDto } from './dto/request-account-flow.dto';
import { Currency } from '../currency/entities/currency.entity';
import { ApiException } from '@app/common/exceptions/api.exception';
import { UserService } from '../system/user/user.service';
import { ProfitRecordService } from '../profit_record/profit_record.service';
import { SysConfigService } from '../system/sys-config/sys-config.service';
import { BrokerageRecordService } from '../brokerage_record/brokerage_record.service';
import { AccountFlow, AccountFlowType, AccountFlowDirection } from './entities/account-flow.entity';

@Injectable()
export class AccountFlowService {
  logger = new Logger(AccountFlowService.name)
  constructor(
    @InjectRepository(AccountFlow) private readonly accountFlowRepository: Repository<AccountFlow>,
    @InjectRepository(Currency) private readonly currencyRepository: Repository<Currency>,
    private readonly profitRecordService: ProfitRecordService,
    private readonly brokerageRecordService: BrokerageRecordService,
    private readonly userService: UserService,
    private readonly sysconfigService: SysConfigService,
  ) { }

  create(createAccountFlowDto: CreateAccountFlowDto) {
    return this.accountFlowRepository.save(createAccountFlowDto);
  }

  /* 分页查询 */
  async list(listAccountFlowList: ListAccountFlowDto, paginationDto: PaginationDto): Promise<PaginatedDto<AccountFlow>> {
    let where: FindOptionsWhere<AccountFlow> = {}
    let result: any;
    where = listAccountFlowList;
    result = await this.accountFlowRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      // relations: { currency: true },
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        createTime: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  /* 分页查询 */
  async mylist(listAccountFlowList: ListMyAccountFlowDto, userId: number, paginationDto: PaginationDto): Promise<PaginatedDto<AccountFlow>> {
    let where: FindOptionsWhere<AccountFlow> = {}
    let result: any;
    where = {
      ... listAccountFlowList,
      userId
    }
    result = await this.accountFlowRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      // relations: { currency: true },
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        createTime: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  findOne(id: number) {
    return this.accountFlowRepository.findOneBy({ id })
  }

  update(id: number, updateAccountFlowDto: UpdateAccountFlowDto) {
    return this.accountFlowRepository.update(id, updateAccountFlowDto)
  }

  deleteOne(id: number) {
    return this.accountFlowRepository.delete(id)
  }

  async delete(ids: number[] | string[]) {
    return this.accountFlowRepository.delete(ids)
  }


}
