import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { FindOperator, FindOptionsWhere, LessThan, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateMemberInfoDto, ListMemberInfoDto } from './dto/request-member-info.dto';
import { CreateMemberDto, ListMemberDto } from './dto/request-member.dto';
import { MemberInfo } from './entities/member-info.entity';
import { Member } from './entities/member.entity';

@Injectable()
export class MemberInfoService {
  constructor(
    @InjectRepository(MemberInfo) private readonly memberInfoRepository: Repository<MemberInfo>,
  ) {}

  async create(createMemberInfoDto: CreateMemberInfoDto, userId: number) {
    // const memberInfo = await this.memberInfoRepository.findOneBy({id: createMemberInfoDto.memberInfoId})
    const newmember: MemberInfo = {
      ...createMemberInfoDto,
      id: undefined,
    }
    return this.memberInfoRepository.save(newmember)
  }

  // findAll() {
  //   return `This action returns all member`;
  // }

  findOne(id: number) {
    return this.memberInfoRepository.findOne({ where: { id: id }, relations: {} })
  }

  // update(id: number, updateMemberDto: UpdateMemberDto) {
  //   return `This action updates a #${id} member`;
  // }

  // /* 新增或编辑 */
  // async addOrUpdateAll(createMemberDto: CreateMemberDto) {
  //   return await this.memberInfoRepository.save(createMemberDto)
  // }

  /* 分页查询 */
  async list(listMemberList: ListMemberInfoDto, paginationDto: PaginationDto): Promise<PaginatedDto<MemberInfo>> {
    let where: FindOptionsWhere<MemberInfo> = {}
    let result: any;
    // let findOp: FindOperator<Date>
    
    // if( listMemberList.status === '0') // invalid
    //   findOp = LessThan(moment().toDate())
    // else if( listMemberList.status === '1') // valid
    //   findOp = MoreThanOrEqual(moment().toDate())
    // else findOp = undefined

    where =
    {
      status: listMemberList.status
    }

    result = await this.memberInfoRepository.findAndCount({
      where,
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        index: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  remove(id: number) {
    return `This action removes a #${id} member`;
  }
}
