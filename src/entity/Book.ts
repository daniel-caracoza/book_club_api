import { ObjectType, Field } from "type-graphql";
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Note } from "./Note";

@ObjectType()
@Entity()
export class Book extends BaseEntity {

    @PrimaryColumn()
    id: number; 

    @Field()
    @Column()
    bookTitle: string;

    @Field()
    @Column()
    image: string; 
    
    @Field()
    @Column()
    author: string; 

    @Field()
    @Column({default: 0})
    currentPage: number;
    
    @OneToMany(() => Note, note => note.book)
    notes: Note[]

}