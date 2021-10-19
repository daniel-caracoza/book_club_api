import { ObjectType, Field, ID } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Invite extends BaseEntity {

    @Field(type => ID)
    @PrimaryGeneratedColumn()
    id: number; 

    @Field()
    @Column()
    sender: string

    @Field()
    @Column({type: "bigint"})
    clubId: string; 

    @Field()
    @Column()
    clubName: string;
    
    @ManyToOne(() => User, user => user.invites)
    user: User;
}