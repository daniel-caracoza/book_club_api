import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Book } from "./Book";

@Entity()
@ObjectType()
export class Note extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number; 

    @Field(type => Int)
    @Column()
    chapter: number; 

    @Field()
    @Column()
    note: string; 

    @ManyToOne(() => Book, book => book.notes)
    book: Book
}