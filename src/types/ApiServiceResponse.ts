import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
export class ApiServiceSearchResponse {

    @Field()
    title: string;
    
    @Field()
    image: string;  

    @Field({nullable: true})
    publisher: string;
    
    @Field()
    isbn13: string; 

    @Field({nullable: true})
    synopsys: string;
    
    @Field(type => Int, {nullable: true})
    pages: number

    @Field(type => [String])
    authors: Array<string>

    constructor(
        title: string, 
        image: string, 
        publisher: string,
        isbn13: string,  
        synopsys: string, 
        pages: number,
        authors: Array<string>){
            this.title = title; 
            this.image = image; 
            this.publisher = publisher;
            this.isbn13 = isbn13; 
            this.synopsys = synopsys; 
            this.pages = pages; 
            this.authors = authors; 
        }
}