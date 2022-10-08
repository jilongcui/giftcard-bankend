/*
 * @Author: Sheng.Jiang
 * @Date: 2021-12-09 14:49:35
 * @LastEditTime: 2022-01-29 11:29:15
 * @LastEditors: Sheng.Jiang
 * @Description: 用户管理 service
 * @FilePath: \meimei-admin\src\modules\system\user\user.service.ts
 * You can you up，no can no bb！！
 */


import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { USER_VERSION_KEY } from '@app/common/contants/redis.contant';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { CreateAccountDto } from '@app/modules/account/dto/request-account.dto';
import { Account } from '@app/modules/account/entities/account.entity';
import { SharedService } from '@app/shared/shared.service';
import { Between, FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { DeptService } from '../dept/dept.service';
import { PostService } from '../post/post.service';
import { ReqRoleListDto } from '../role/dto/req-role.dto';
import { RoleService } from '../role/role.service';
import { ReqAddUserDto, ReqSetSelfPwd, ReqUpdataSelfDto, ReqUpdateSelfPwd, ReqUpdateUserDto, ReqUserListDto } from './dto/req-user.dto';
import { ResAuthRoleDto, ResHasRoleDto } from './dto/res-user.dto';
import { User } from './entities/user.entity';
import { AddressService } from '@app/modules/wallet/address/address.service';
import { ReqAddressCreateDto } from '@app/modules/wallet/address/dto/req-address.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { InviteUserService } from '@app/modules/inviteuser/invite-user.service';
import { ReqUpdateInviteUserDto } from '@app/modules/inviteuser/dto/request-inviteuser.dto';
import { InviteUser } from '@app/modules/inviteuser/entities/invite-user.entity';
const strRandom = require('string-random');

@Injectable()
export class UserService {
    logger = new Logger(UserService.name);
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Account) private readonly accountRepository: Repository<Account>,
        @InjectRepository(InviteUser) private readonly inviteUserRepository: Repository<InviteUser>,
        @Inject(forwardRef(() => RoleService)) private readonly roleService: RoleService,
        @InjectRedis() private readonly redis: Redis,
        private readonly postService: PostService,
        private readonly deptService: DeptService,
        private readonly sharedService: SharedService,
        private readonly addressService: AddressService,
    ) { }

    /* 通过用户名获取用户,排除停用和删除的,用于登录 */
    async findOneByUsername(username: string) {
        const user = await this.userRepository.createQueryBuilder('user')
            .select('user.userId')
            .addSelect('user.userName')
            .addSelect('user.password')
            .addSelect('user.securityStatus')
            .addSelect('user.salt')
            .addSelect('user.dept')
            .leftJoinAndSelect('user.dept', 'dept')
            .leftJoinAndSelect('user.identity', 'identity')
            .where({
                userName: username,
                delFlag: '0',
                status: '0'
            })
            .getOne()
        return user
    }

    /* 通过用户名获取用户,排除停用和删除的,用于登录 */
    async findOneByPhone(phone: string) {
        const user = await this.userRepository.createQueryBuilder('user')
            .select('user.userId')
            .addSelect('user.userName')
            .addSelect('user.password')
            .addSelect('user.securityStatus')
            .addSelect('user.salt')
            .addSelect('user.dept')
            .leftJoinAndSelect('user.dept', 'dept')
            .leftJoinAndSelect('user.identity', 'identity')
            .where({
                phonenumber: phone,
                delFlag: '0',
                status: '0'
            })
            .getOne()
        return user
    }

    /* 通过用户名获取用户,排除停用和删除的,用于登录 */
    async findOneByInviteCode(inviteCode: string) {
        return await this.userRepository.findOne({ where: { inviteCode: inviteCode } })
    }

    /* 通过用户名获取用户,排除删除的 */
    async findOneByUserNameState(username: string) {
        return await this.userRepository.findOne({
            select: ['userId', 'userName', 'password', 'salt', 'status', 'delFlag'],
            where: {
                userName: username,
                delFlag: '0',
            }
        });
    }

    /* 分页查询用户列表 */
    async list(reqUserListDto: ReqUserListDto, paginationDto: PaginationDto, roleId?: number, reverse?: Boolean, sataScopeSql?: string): Promise<PaginatedDto<User>> {
        let where: FindOptionsWhere<User> = { delFlag: '0' }
        if (reqUserListDto.userName) {
            where.userName = Like(`%${reqUserListDto.userName}%`)
        }
        if (reqUserListDto.phonenumber) {
            where.phonenumber = Like(`%${reqUserListDto.phonenumber}%`)
        }
        if (reqUserListDto.status) {
            where.status = reqUserListDto.status
        }
        if (reqUserListDto.params) {
            where.createTime = Between(reqUserListDto.params.beginTime, moment(reqUserListDto.params.endTime).add(1, 'day').toDate())
        }

        const deptId = reqUserListDto.deptId ?? ''
        const queryBuilde = this.userRepository.createQueryBuilder('user') // .innerJoin(User, 'user2', "user.createBy = user2.userName")
        if (deptId) {
            queryBuilde.innerJoinAndSelect("user.dept", "dept", "concat('.',dept.mpath) like :v", { v: '%.' + deptId + '.%' })
        } else {
            queryBuilde.leftJoinAndSelect("user.dept", "dept")
        }
        queryBuilde.skip(paginationDto.skip)
        queryBuilde.take(paginationDto.take)
        if (roleId && !reverse) {
            queryBuilde.innerJoin("user.roles", "role", "role.roleId = :roleId", { roleId })
                .andWhere("role.delFlag = 0")
        }
        if (roleId && reverse) {
            queryBuilde.andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select('user.userId')
                    .from(User, 'user')
                    .leftJoin('user.roles', 'role')
                    .where("role.roleId = :roleId", { roleId })
                    .getQuery()
                return "user.userId not in " + subQuery
            })
        }
        // if (sataScopeSql) {
        //     queryBuilde.andWhere(sataScopeSql)
        // }

        const result = await queryBuilde.andWhere(where).orderBy("user.userId", 'DESC').getManyAndCount()
        return {
            rows: result[0],
            total: result[1]
        }
    }

    //通过id 查找用户的所有信息
    async userAllInfo(userId: number): Promise<User> {
        return await this.userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.dept', 'dept', "dept.delFlag = 0")
            .leftJoinAndSelect('user.identity', 'identity')
            .leftJoinAndSelect('user.posts', 'post')
            .leftJoinAndSelect('user.roles', 'role', "role.delFlag = 0")
            .where("user.userId = :userId", { userId })
            .getOne()
    }

    /* 通过id 查询用户的所有信息，排除停用和删除的 */
    async findOneUserAllById(userId: number): Promise<User> {
        const user: User = await this.userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.dept', 'dept', "dept.delFlag = 0 and dept.status = 0")
            .leftJoinAndSelect('user.identity', 'identity')
            .leftJoinAndSelect('user.posts', 'post', "dept.status = 0")
            .leftJoinAndSelect('user.roles', 'role', "role.delFlag = 0 and role.status = 0")
            .where({
                userId,
                delFlag: '0',
                status: '0'
            })
            .getOne()
        return user
    }

    private randomId(): number {
        return Math.floor((Math.random() * 9999999) + 10000000);
    }

    /* 新增用户 */
    async addUser(reqAddUserDto: ReqAddUserDto) {
        const dept = await this.deptService.findById(reqAddUserDto.deptId)
        const posts = await this.postService.listByIdArr(reqAddUserDto.postIds)
        const roles = await this.roleService.listByIdArr(reqAddUserDto.roleIds)
        reqAddUserDto.dept = dept
        reqAddUserDto.posts = posts
        reqAddUserDto.roles = roles
        if (reqAddUserDto.password) {
            reqAddUserDto.salt = this.sharedService.generateUUID()
            reqAddUserDto.password = this.sharedService.md5(reqAddUserDto.password + reqAddUserDto.salt)
        }

        // Add invite code.
        const userDto = {
            ...reqAddUserDto,
            inviteCode: strRandom(6).toLowerCase()
        }
        const user = await this.userRepository.save(userDto)

        if (reqAddUserDto.nickName == undefined || reqAddUserDto.nickName == '') {
            const nickName = `用户${user.userId}`
            await this.userRepository.update(user.userId, { nickName: nickName })
        }

        // Create user account.
        let createAccountDto = new CreateAccountDto()
        createAccountDto.userId = user.userId
        createAccountDto.currencyId = 1
        createAccountDto.status = '0'
        await this.accountRepository.save(createAccountDto)

        // Create address record.
        const createAddressDto = new ReqAddressCreateDto()
        createAddressDto.appId = 0
        createAddressDto.addressType = 'CRI'
        createAddressDto.userId = user.userId
        await this.addressService.addressCreate(createAddressDto)
        return user;
    }

    /* 编辑用户 */
    async updateUser(reqUpdateUserDto: ReqUpdateUserDto) {
        const dept = await this.deptService.findById(reqUpdateUserDto.deptId)
        const posts = await this.postService.listByIdArr(reqUpdateUserDto.postIds)
        const roles = await this.roleService.listByIdArr(reqUpdateUserDto.roleIds)
        reqUpdateUserDto.dept = dept
        reqUpdateUserDto.posts = posts
        reqUpdateUserDto.roles = roles
        await this.userRepository.save(reqUpdateUserDto)
        if (await this.redis.get(`${USER_VERSION_KEY}:${reqUpdateUserDto.userId}`)) {
            await this.redis.set(`${USER_VERSION_KEY}:${reqUpdateUserDto.userId}`, 2)  //调整密码版本，强制用户重新登录
        }
    }

    /* 删除用户 */
    async delete(userIdArr: string[], userName: string) {
        return await this.userRepository.createQueryBuilder()
            .update()
            .set({
                updateBy: userName,
                delFlag: '2'
            })
            .where({
                userId: In(userIdArr)
            })
            .execute()
    }

    /* id查询用户 */
    async findById(userId: number) {
        return await this.userRepository.findOneBy({ userId })
    }

    async findAccount(userId: number) {
        return await this.accountRepository.findOneBy({ userId: userId, currencyId: 1 })
    }

    async updateAccount(userId: number) {
        let account = await this.accountRepository.findOneBy({ userId: userId, currencyId: 1 })
        if (account == null) {
            let createAccountDto = new CreateAccountDto()
            createAccountDto.userId = userId
            createAccountDto.currencyId = 1
            createAccountDto.status = '0'
            account = await this.accountRepository.save(createAccountDto)
        }
        return account;
    }

    /* 更改密码 */
    async resetPwd(userId: number, password: string, updateBy: string) {
        let user = await this.findById(userId)
        user.updateBy = updateBy
        user.salt = this.sharedService.generateUUID()
        user.password = this.sharedService.md5(password + user.salt)
        await this.userRepository.save(user)
        if (await this.redis.get(`${USER_VERSION_KEY}:${userId}`)) {
            await this.redis.set(`${USER_VERSION_KEY}:${userId}`, 2)  //调整密码版本，强制用户重新登录
        }
    }

    /* 查询用户被分配的角色和角色列表 */
    async authRole(userId: number): Promise<ResAuthRoleDto> {
        const { rows } = await this.roleService.list(new ReqRoleListDto())
        const user = await this.userAllInfo(userId)
        const roles: ResHasRoleDto[] = rows.map(item => {
            if (user.roles.find(role => role.roleId === item.roleId)) {
                (item as ResHasRoleDto).flag = true
            } else {
                (item as ResHasRoleDto).flag = false
            }
            return item as ResHasRoleDto
        })
        roles.forEach(item => {
            if (user.roles.find(role => role.roleId === item.roleId)) {
                (item as any).flag = true
            }
        })
        return {
            roles,
            user
        }
    }

    /* 给用户分配角色 */
    async updateAuthRole(userId: number, roleIdArr: number[], updateBy: string) {
        const user = await this.findById(userId)
        const roles = await this.roleService.listByIdArr(roleIdArr)
        user.updateBy = updateBy
        user.roles = roles
        return await this.userRepository.save(user)
    }

    /* 改变用户状态 */
    async changeStatus(userId: number, status: string, updateBy: string) {
        return await this.userRepository
            .createQueryBuilder()
            .update()
            .set({ status, updateBy })
            .where({ userId })
            .execute()
    }

    /* 更新自己的用户信息 */
    async updataProfile(reqUpdataSelfDto: ReqUpdataSelfDto, userId: number) {
        if (reqUpdataSelfDto.nickName || reqUpdataSelfDto.avatar) {
            // 更新一下邀请记录
            let reqUpdateInviteUserDto: ReqUpdateInviteUserDto = {
                id: userId,
                nickName: reqUpdataSelfDto.nickName,
                avatar: reqUpdataSelfDto.avatar
            }
            await this.inviteUserRepository.update(reqUpdateInviteUserDto.id, reqUpdateInviteUserDto)
        }
        return await this.userRepository.createQueryBuilder()
            .update()
            .set(reqUpdataSelfDto)
            .where({ userId })
            .execute()
    }

    /* 更新自己的密码 */
    async updateSelfPwd(reqUpdateSelfPwd: ReqUpdateSelfPwd, userName: string) {
        const user = await this.findOneByUsername(userName)
        const password = this.sharedService.md5(reqUpdateSelfPwd.oldPassword + user.salt)
        if (password !== user.password) throw new ApiException('旧密码错误')
        user.password = this.sharedService.md5(reqUpdateSelfPwd.newPassword + user.salt)
        await this.userRepository.save(user)
        if (await this.redis.get(`${USER_VERSION_KEY}:${user.userId}`)) {
            await this.redis.set(`${USER_VERSION_KEY}:${user.userId}`, 2)  //调整密码版本，强制用户重新登录
        }
    }

    /* 设置自己的新密码 */
    async setSelfPwd(reqSetSelfPwd: ReqSetSelfPwd, userName: string) {
        const user = await this.findOneByUsername(userName)
        if (user.securityStatus !== '0') throw new ApiException('已设置密码')
        user.password = this.sharedService.md5(reqSetSelfPwd.newPassword + user.salt)
        user.securityStatus = '1'
        await this.userRepository.save(user)
        if (await this.redis.get(`${USER_VERSION_KEY}:${user.userId}`)) {
            await this.redis.set(`${USER_VERSION_KEY}:${user.userId}`, 2)  //调整密码版本，强制用户重新登录
        }
    }

    /* 导入批量插入用户 */
    async insert(data: any) {
        let userArr: User[] = []
        for await (const iterator of data) {
            let user = new User()
            if (!iterator.userName || !iterator.password || !iterator.nickName) throw new ApiException('用户账号、用户昵称、用户密码不能为空')
            const one = await this.findOneByUsername(iterator.userName)
            if (one) throw new ApiException('用户账号已存在，请检查')
            iterator.salt = await this.sharedService.generateUUID()
            iterator.password = this.sharedService.md5(iterator.password + iterator.salt)
            user = Object.assign(user, iterator)
            userArr.push(user)
        }
        await this.userRepository.createQueryBuilder()
            .insert()
            .into(User)
            .values(userArr)
            .execute()
    }
}
