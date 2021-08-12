import { userInfo } from "os";
import { Field, ID, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany, JoinTable} from "typeorm";
import { Book } from "./Book";
import { Club } from "./Club";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    
    @Field(type => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    username: string;
    
    @Field()
    @Column()
    email: string; 

    @Column()
    password: string;

    @Column({default: false})
    confirmed: boolean

    @ManyToMany(() => Book)
    @JoinTable()
    books: Book[]; 

    @ManyToMany(() => Club)
    @JoinTable()
    clubs: Club[]; 

}
