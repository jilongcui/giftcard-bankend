import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { FindOperator, FindOptionsWhere, LessThan, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateMemberDto, ListMemberDto } from './dto/request-member.dto';
import { MemberInfo } from './entities/member-info.entity';
import { Member } from './entities/member.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(MemberInfo) private readonly memberInfoRepository: Repository<MemberInfo>,
    @InjectRepository(Member) private readonly memberRepository: Repository<Member>,
  ) {}

  async create(createMemberDto: CreateMemberDto, userId: number) {
    const memberInfo = await this.memberInfoRepository.findOneBy({id: createMemberDto.memberInfoId})
    let member = await this.memberRepository.findOneBy({userId: userId})
    let endTime = moment().add(memberInfo.days, 'days');

    if (member) {
      if (moment().isBefore(moment(member.endTime))) {
        endTime = moment(member.endTime).add(memberInfo.days, 'days')
      }
    }
    const newmember: Member = {
      id: member? member.id : undefined,
      memberInfoId: createMemberDto.memberInfoId,
      userId,
      startTime: moment().toDate(),
      endTime: endTime.toDate()
    }
    return this.memberRepository.save(newmember)
  }

  // findAll() {
  //   return `This action returns all member`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} member`;
  // }

  findOne(id: number) {
    return this.memberRepository.findOne({ where: { id: id }, relations: { user: true, memberInfo: true } })
  }

  // update(id: number, updateMemberDto: UpdateMemberDto) {
  //   return `This action updates a #${id} member`;
  // }

  /* 新增或编辑 */
  async addOrUpdateAll(createMemberDto: CreateMemberDto) {
    return await this.memberRepository.save(createMemberDto)
  }

  /* 分页查询 */
  async list(listMemberList: ListMemberDto, paginationDto: PaginationDto): Promise<PaginatedDto<Member>> {
    let where: FindOptionsWhere<Member> = {}
    let result: any;
    let findOp: FindOperator<Date>
    
    if( listMemberList.status === '0') // invalid
      findOp = LessThan(moment().toDate())
    else if( listMemberList.status === '1') // valid
      findOp = MoreThanOrEqual(moment().toDate())
    else findOp = undefined

    where =
    {
      endTime: findOp
    }

    result = await this.memberRepository.findAndCount({
      where,
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        updateTime: 'DESC',
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
