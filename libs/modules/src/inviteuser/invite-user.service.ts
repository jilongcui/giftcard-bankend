import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository, TreeRepository } from 'typeorm';
import { User } from '@app/modules/system/user/entities/user.entity';
import { ApiException } from '@app/common/exceptions/api.exception';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../system/user/user.service';

@Injectable()
export class InviteUserService {
    logger = new Logger(InviteUserService.name)
    inviteUserTreeRepository: TreeRepository<User>
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        private readonly userService: UserService,
    ) {
        this.inviteUserTreeRepository = this.dataSource.manager.getTreeRepository<User>(User)
    }

    async bindInviteCode(userId: number, code: string) {
        const parent = await this.userService.findOneByInviteCode(code)
        if (!parent) {
            throw new ApiException('邀请码不存在')
        }
        this.logger.debug(userId)
        const user = await this.userService.findById(userId)
        return await this.bindParent(userId, parent.userId)
    }
    async bindParent(userId: number, parentId: number) {
        let inviteUser = await this.inviteUserTreeRepository.findOneBy({ userId: userId })
        const parent = await this.inviteUserTreeRepository.findOneBy({ userId: parentId })
        if (!parent) {
            throw new ApiException('邀请用户没找到')
        }
        if (!inviteUser) {
            throw new ApiException('被邀请用户没找到')
        }
        // const initParent = new InviteUser()
        // initParent.userId = parentId
        // initParent.userName = 'admin'
        // await this.inviteUserRepository.save(initParent)
        // }
        // inviteUser.parent = parent

        return await this.inviteUserTreeRepository.save(inviteUser)
    }

    async allTree() {
        let trees = await this.inviteUserTreeRepository.findTrees()

        return trees
    }

    async treeChildren(userId: number) {
        let inviteUser = await this.inviteUserTreeRepository.findOneBy({ userId: userId })
        if (inviteUser) {
            this.logger.debug(inviteUser.userId)
            const children = await this.inviteUserTreeRepository.findDescendantsTree(inviteUser, { depth: 3 })
            return children
        }
        return null
    }

    async flatChildren(userId: number) {
        let inviteUser = await this.inviteUserTreeRepository.findOneBy({ userId: userId })
        if (inviteUser) {
            const children = await this.inviteUserTreeRepository.findDescendants(inviteUser, { depth: 3 })
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
