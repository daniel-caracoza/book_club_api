import { Field, Float, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, Index, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@ObjectType()
export class Club extends BaseEntity {

    //use the isbn of the book to make seeing existing book clubs 
    @Field(type => Float)
    @Index()
    @PrimaryColumn({type: "bigint"})
    id: string; 

    @Field()
    @Column()
    clubName: string;

    @OneToMany(() => ClubTopic, clubTopic => clubTopic.club)
    topics: ClubTopic[]; 

}
@Entity()
@ObjectType()
export class ClubTopic extends BaseEntity {

    @Field()
    @PrimaryGeneratedColumn("uuid")
    id: string; 
    
    @Field()
    @Column()
    topic: string; 

    @ManyToOne(() => Club, club => club.topics)
    club: Club; 

    @Field(type => [Comment])
    @OneToMany(() => Comment, comment => comment.clubTopic)
    comments: Comment[]
}

@ObjectType()
@Entity()
export class Comment extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number; 

    @Field()
    @Column()
    sender: string; 

    @Field()
    @Column()
    comment: string; 

    @Field()
    @Column()
    date: Date; 

    @ManyToOne(() => ClubTopic, clubTopic => clubTopic.comments)
    clubTopic: ClubTopic; 
}