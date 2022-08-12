import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Tag {
    @PrimaryGeneratedColumn({
        name: 'tag_id'
    })
    tagId: number

    @Column({
        name: 'tag_name',
        comment: '标签名称'
    })
    tagName: string
}
