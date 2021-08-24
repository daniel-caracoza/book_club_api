import { ObjectType, Field, Int, Float } from "type-graphql";
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn, Index } from "typeorm";
import { Note } from "./Note";

@ObjectType()
@Entity()
export class Book extends BaseEntity {

    @Field(type => Float)
    @Index()
    @PrimaryColumn({type: "bigint"})
    id: string; 

    @Field()
    @Column()
    bookTitle: string;

    @Field()
    @Column()
    image: string; 
    
    @Field()
    @Column()
    author: string; 

    @Field(type => Int)
    @Column({default: 0})
    currentPage: number;
    
    @OneToMany(() => Note, note => note.book)
    notes: Note[]

}