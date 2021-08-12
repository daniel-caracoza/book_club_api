import { InputType, Field } from "type-graphql";
import { Book } from "../entity/Book";

@InputType()
export class BookInput implements Partial<Book> {

    @Field()
    id: number; 

    @Field()
    bookTitle: string;

    @Field()
    image: string; 
    
    @Field()
    author: string; 

}