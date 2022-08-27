import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '@app/modules/system/user/entities/user.entity';
import { InviteUser } from './entities/invite-user.entity';
import { ApiException } from '@app/common/exceptions/api.exception';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class InviteUserService {
    constructor(
        @InjectRepository(InviteUser) private readonly inviteUserRepository: Repository<InviteUser>
    ) { }

    async bindParent(user: User, parentId: number) {
        let inviteUser = await this.inviteUserRepository.findOneBy({ userId: user.userId })
        const parent = await this.inviteUserRepository.findOneBy({ userId: parentId })
        // if (!parent) {
        // if (parentId !== 1) {
        //     throw new ApiException('父类没被邀请')
        // }
        // const initParent = new InviteUser()
        // initParent.userId = parentId
        // initParent.userName = 'admin'
        // await this.inviteUserRepository.save(initParent)
        // }
        if (inviteUser) {
            inviteUser.parent = parent
        } else {
            inviteUser = new InviteUser()
            inviteUser.userId = user.userId
            inviteUser.userName = user.userName
            inviteUser.parent = parent
        }

        return await this.inviteUserRepository.save(inviteUser)
    }
}
