import { Resolver, Authorized, Mutation, Arg, Ctx, Query } from "type-graphql";
import { User } from "../entity/User";
import { Book } from "../entity/Book"; 
import { BookInput } from "../types/BookInput";
import { Context } from "../context.interface"; 

@Resolver()
export class BookResolver {
    @Authorized()
    @Mutation(returns => Book)
    async addToReadingList(
        @Arg("book") bookInput: BookInput,  
        @Ctx() {payload}: Context
    ): Promise<Book>{
        try {
            const user = await User.findOne({where: {id: parseInt(payload.userId)}})
            const book = await Book.create(bookInput).save(); 
            await User.createQueryBuilder()
            .relation(User, "books")
            .of(user)
            .add(book); 
            await user.save(); 
            return book; 
        } catch(error){
            console.log(error); 
        }
    }

    @Authorized()
    @Query(returns => Boolean)
    async doesUserBookExist(
        @Arg("bookId") bookId: string, 
        @Ctx() {payload}: Context
    ): Promise<boolean> {
        try {
            const userId = payload.userId; 
            const userInfo = await User.createQueryBuilder("user")
            .innerJoinAndSelect("user.books", "book")
            .where("user.id=:userId", {userId})
            .andWhere("book.id=:bookId", {bookId})
            .getOne()
            
            if(!userInfo){
                return false; 
            }
            return true; 
        } catch(error){
            console.log(error);
        }
    }

    @Authorized()
    @Query(returns => [Book], {nullable: true})
    async userBooks(
        @Ctx() {payload}: Context
    ): Promise<Book[]> {
        try {
            const userId = payload.userId; 
            const userInfo = await User.createQueryBuilder("user")
            .innerJoinAndSelect("user.books", "book")
            .where("user.id=:userId", {userId})
            .getMany();
            if(userInfo.length === 0){
                return []; 
            }
            return userInfo[0].books; 
        } catch (error){
            console.log(error); 
        }
    }
}