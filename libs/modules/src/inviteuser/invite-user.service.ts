import { Injectable } from '@nestjs/common';
import { Repository, TreeRepository } from 'typeorm';
import { User } from '@app/modules/system/user/entities/user.entity';
import { InviteUser } from './entities/invite-user.entity';
import { ApiException } from '@app/common/exceptions/api.exception';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class InviteUserService {
    constructor(
        @InjectRepository(InviteUser) private readonly inviteUserTreeRepository: TreeRepository<InviteUser>
    ) { }

    async bindParent(user: User, parentId: number) {
        let inviteUser = await this.inviteUserTreeRepository.findOneBy({ userId: user.userId })
        const parent = await this.inviteUserTreeRepository.findOneBy({ userId: parentId })
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

        return await this.inviteUserTreeRepository.save(inviteUser)
    }

    async treeChildren(userId: number) {
        let inviteUser = await this.inviteUserTreeRepository.findOneBy({ userId: userId })
        if (inviteUser) {
            const children = await this.inviteUserTreeRepository.findDescendantsTree(inviteUser, { depth: 2 })
            return children
        }
        return null
    }

    async flatChildren(userId: number) {
        let inviteUser = await this.inviteUserTreeRepository.findOneBy({ userId: userId })
        if (inviteUser) {
            const children = await this.inviteUserTreeRepository.findDescendants(inviteUser, { depth: 2 })
            return children
        }
        return null
    }

    async parent(userId: number) {
        let inviteUser = await this.inviteUserTreeRepository.findOneBy({ userId: userId })
        let parents = await this.inviteUserTreeRepository.findAncestors(inviteUser, { depth: 1 })
        if (parents) {
            return parents[0]
        }
        return null
    }

    async relationship(userId: number) {
        let inviteUser = await this.inviteUserTreeRepository.findOneBy({ userId: userId })
        let parents = await this.inviteUserTreeRepository.findAncestors(inviteUser)
        if (inviteUser) {
            let children = await this.inviteUserTreeRepository.findDescendantsTree(inviteUser, { depth: 2 })
            return {
                parent: parents[0],
                children: children,
            }
        }
        return null
    }
}
