import { Resolver, Mutation, Root, Subscription, Arg, Ctx, Authorized, Query } from "type-graphql"
import { PubSub as ps} from "apollo-server-express"; 
import { Club, ClubTopic, Comment } from "../entity/Club"
import { User } from "../entity/User"
import {  getConnection } from "typeorm";
import { Context } from "../context.interface";

const pSub = new ps(); 

@Resolver()
export class ClubResolver {
    
    @Authorized()
    @Mutation(returns => Club)
    async createClub(
        @Arg("clubId") clubId: string,
        @Arg("clubName") clubName: string,
        @Ctx() {payload}: Context 
    ): Promise<Club> {
        const new_club = Club.create({
            id: clubId, 
            clubName: clubName
        }) 
        const userId = payload.userId
        //save server to user that created it
        try {
            await new_club.save()
            const user = await User.findOne({where: {id: parseInt(userId)}})
            user.clubs = [new_club]
            getConnection().getRepository(User).save(user); 
        } catch (err) {
            console.log(err)
        }
        return new_club
    }

    @Authorized()
    @Mutation(returns => ClubTopic, {nullable: true})
    async createTopic(
        @Arg("clubId") clubId: string,
        @Arg("topic") topic: string, 
    ):Promise<ClubTopic> | null{
        try {
            const club = await Club.findOne({where: {id: clubId}})
            if(!club){
                return null
            }
            const new_topic = await ClubTopic.create({
                topic
            }).save(); 
            club.topics = [new_topic];
            await club.save(); 
            return new_topic; 
        } catch(err){
            console.log(err); 
        }
    }

    @Authorized()
    @Mutation(returns => Comment, {nullable: true})
    async topicComment(
        @Arg("clubTopicId") clubTopicId: string, 
        @Arg("comment") msg: string, 
        @Ctx() ctx: Context
    ): Promise<Comment> | null {
        let comment = new Comment()
        comment.sender = ctx.payload.username
        comment.comment = msg
        comment.date = new Date()
        const clubTopic = await ClubTopic.findOne({where: {id: clubTopicId}})
        if(!clubTopic){
            return null; 
        }
        await comment.save(); 
        clubTopic.comments = [comment];
        pSub.publish(clubTopicId, comment);  
        return comment; 
    }

    @Authorized()
    @Query(returns => [Club], {nullable: true})
    async getClubs(
        @Ctx() {payload}: Context
    ): Promise<Club[]> | null {
        const userId = payload.userId; 
        const user = await User.createQueryBuilder<User>("user")
        .innerJoinAndSelect("user.clubs", "club")
        .where("user.id=:userId", {userId})
        .getMany(); 
        return user[0].clubs; 
    }

    @Authorized()
    @Query(returns => [ClubTopic], {nullable: true})
    async clubTopics(
        @Arg("clubId") clubId: string
    ): Promise<ClubTopic[]> | null {
        const topics = await ClubTopic.createQueryBuilder("clubTopic")
        .leftJoinAndSelect("clubTopic.club", "club")
        .getMany()

        return topics; 
    }



    @Authorized()
    @Query(returns => [Comment])
    async topicComments(
        @Arg("clubTopicId") clubTopicId: string 
    ): Promise<Comment[]> | null { 
        const comments = await Comment.createQueryBuilder("comment")
        .leftJoinAndSelect("comment.clubTopic", "clubTopic")
        .getMany()
        return comments; 
    }
    
    @Subscription(returns => Comment, {
        topics: ({args}) => args.clubTopicId
    })
    async subscribeToTopic(
        @Arg("clubTopicId") clubTopicId: string,
        @Root() payload: Comment
    ): Promise<Comment> {
        return payload
    }
}