import {Resolver, Query, Mutation, Arg, Ctx, Authorized} from "type-graphql"; 
import { User } from "../entity/User";
import { Book } from "../entity/Book"; 
import * as bcrypt from "bcrypt"; 
import { Context } from "../context.interface";
import { LoginResponse } from "../types/LoginResponse";
import { generateAccessToken, generateRefreshToken } from "../auth/auth";
import {sendRefreshToken} from "../auth/sendRefreshToken"
import { createConfirmationUrl } from "../utils/createConfirmationUrl";
import { sendEmail } from "../utils/sendEmail";
import { verify } from "jsonwebtoken";

@Resolver()
export class UserResolver {

    @Authorized()
    @Query(() => User, {nullable: true})
    async me(
        @Ctx() {payload}: Context
    ): Promise<User> | null {
        try {
            const user = await User.findOne(payload.userId);
            return user;  
        } catch(err){
            console.log(err); 
        }
    }

    @Mutation(() => User)
    async register(
        @Arg('username') username: string,
        @Arg('email') email: string,  
        @Arg('password') password: string): Promise<User>{
            try {
                const hashedPassword = await bcrypt.hash(password, 12); 
                const user = await User.create({
                    username: username,
                    email: email,  
                    password: hashedPassword, 
                    books: new Array<Book>()
                }).save();
                const url = await createConfirmationUrl(user.id);
                await sendEmail(email, url)  
                return user;

            } catch(error){
                console.log(error); 
            }
    }

    @Mutation(() => LoginResponse, {nullable: true})
    async login(
        @Arg("username") username: string,
        @Arg("password") password: string,
        @Ctx() ctx: Context): Promise<LoginResponse> | null {
            
            const user = await User.findOne({where: {username}});
            if(!user){
                return null; 
            }

            if(!user.confirmed){
                return null; 
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if(!validPassword){
                return null;
            }
            sendRefreshToken(ctx.res, generateRefreshToken(user))
            //passes all checks - login successful
            return {
                accessToken: generateAccessToken(user),
                user: user
            }

        }
    
    @Mutation(() => LoginResponse, {nullable: true})
    async refreshAccessToken(
        @Ctx() ctx: Context
    ): Promise<LoginResponse> {
        const refreshToken = ctx.req.cookies['jid'];
        if(!refreshToken){
            return null; 
        }
        //validate token
        try {
            const payload: any = await verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            if(!payload){
                throw new Error("not authenticated")
            }
            const user = await User.findOne({where: {id: payload.userId}}) 
            sendRefreshToken(ctx.res, generateRefreshToken(user));
            return {
                accessToken: generateAccessToken(user), 
                user: user
            }
        } catch (err){
            console.log(err); 
        }
    }


}