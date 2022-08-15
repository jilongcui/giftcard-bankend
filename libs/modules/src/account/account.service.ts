import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateAccountDto, ListAccountDto, UpdateAccountDto, UpdateAllAccountDto } from './dto/request-account.dto';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account) private readonly accountRepository: Repository<Account>,
  ) { }

  create(createAccountDto: CreateAccountDto) {
    return this.accountRepository.save(createAccountDto);
  }

  /* 新增或编辑 */
  async addOrUpdateAll(createAccountDto: UpdateAllAccountDto) {
    return await this.accountRepository.save(createAccountDto)
  }

  /* 分页查询 */
  async list(listAccountList: ListAccountDto, paginationDto: PaginationDto): Promise<PaginatedDto<Account>> {
    let where: FindOptionsWhere<Account> = {}
    let result: any;
    where = listAccountList;
    result = await this.accountRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        // createTime: 1,
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  findOne(id: number) {
    return this.accountRepository.findOneBy({ id })
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return this.accountRepository.update(id, updateAccountDto)
  }

  deleteOne(id: number) {
    return this.accountRepository.delete(id)
  }

  async delete(ids: number[] | string[]) {
    return this.accountRepository.delete(ids)
  }
}
