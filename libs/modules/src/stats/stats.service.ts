import { ParamsDto } from '@app/common/dto/params.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { FindOptionsWhere, Between, In, Like, Repository } from 'typeorm';
import { InviteUser } from '../inviteuser/entities/invite-user.entity';
import { User } from '../system/user/entities/user.entity';
import { UserInviteStatsDto } from './dto/request-stats.dto';

@Injectable()
export class StatsService {
    logger = new Logger(StatsService.name)

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(InviteUser) private readonly inviteUserRepository: Repository<InviteUser>,
    ) { }

    getInfo() {

    }

    async getUserInviteInfo(params: UserInviteStatsDto) {
        let where: FindOptionsWhere<InviteUser> = {}
        where.createTime = Between(params.beginTime, params.endTime)
        const myQueryBuilder = this.inviteUserRepository.createQueryBuilder('inviteUser')
            .select('count(*)', 'inviteCount')
            .addSelect('parent.id', 'userId')
            .addSelect('parent.user_name', 'userName')
            .leftJoin('inviteUser.parent', 'parent')
            .where(where)
            .orderBy('inviteCount', 'DESC')
            .groupBy('inviteUser.parentId')
            .limit(params.count)
        this.logger.debug(myQueryBuilder.getQuery())
        // this.logger.debug(myQueryBuilder.getSql())

        const resultArr = await myQueryBuilder.getRawMany()
        return resultArr.map((item, index) => { item.rank = index + 1; return item })
    }
}
