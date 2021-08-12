import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class GoogleBooksResponse {

    @Field()
    bookTitle: string; 

    @Field(type => [String])
    author: Array<string>; 

    @Field({nullable: true})
    description: string; 

    @Field()
    bookImg_url: string; 

    constructor(title: string, author:Array<string>, description: string, img: string){
        this.bookTitle = title; 
        this.author = author; 
        this.description = description; 
        this.bookImg_url = img; 
    }
}