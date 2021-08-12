import { Connection } from "typeorm";
import { gCall } from "../test-utils/gCall";
import { testConn } from "../test-utils/testConn"
import * as dotenv from "dotenv"; 
import * as faker from "faker"
import { Club } from "../entity/Club";
import { User } from "../entity/User";
import { generateAccessToken } from "../auth/auth";
dotenv.config()
let conn: Connection; 

beforeAll(async() => {
   conn = await testConn(); 
})

afterAll(async() => {
    await conn.close()
})

const createClub = `
mutation CreateClub($clubId: String!, $clubName: String!){
    createClub(clubId: $clubId, clubName: $clubName){
        clubName
    }
}
`
const createTopic = `
mutation CreateTopic($clubId: String!, $topic: String!){
    createTopic(clubId: $clubId, topic: $topic){
        id
        topic
    }
}
`
const getUserClubs = `
query GetClubs{
    getClubs{
        id
        clubName
    }
}
`

const getClubTopics = `
query ClubTopics($clubId: String!){
    clubTopics(clubId: $clubId){
        id
        topic
    }
}
`
const createComment = `
mutation TopicComment($clubTopicId: String!, $comment: String!){
    topicComment(clubTopicId: $clubTopicId, comment: $comment){
        sender
        comment
        date
    }
}
`

const getComments = `
query TopicComments($clubTopicId: String!){
    topicComments(clubTopicId: $clubTopicId){
        sender
        comment
        date
    }
}
`

describe("Testing club resolver", () => {
    const clubId = "12345"
    const fakeClubName = faker.name.firstName();
    const fakeTopic = faker.name.firstName();  
    let token; 
    let topicId; 
    it("create a club", async() => {
        const user = await User.create({
            username: faker.name.firstName(),
            email: faker.internet.email(), 
            password: faker.internet.password(),
            clubs: Array<Club>()
        }).save()
        //create auth token for dummy user
        token = generateAccessToken(user); 
        const response = await gCall({
            source: createClub, 
            variableValues: {
                clubId, 
                clubName: fakeClubName
            },
            id: user.id, 
            token
        })
        expect(response).toMatchObject({
            data: {
                createClub: {
                    clubName: fakeClubName
                }
            }
        })
        //check to see if club was created
        const club = await Club.findOne({where: {id: clubId}})
        expect(club).toBeDefined(); 
    })
    it("get users clubs", async() => {
        const response = await gCall({
            source: getUserClubs, 
            token
        })

        expect(response).toMatchObject({
            data: {
                getClubs: [
                    {
                        id: parseFloat(clubId), 
                        clubName: fakeClubName
                    }
                ]
            }
        })
    })
    it("create a club topic", async() => {
        const response = await gCall({
            source: createTopic, 
            variableValues: {
                clubId, 
                topic: fakeTopic
            }, 
            token
        })
        topicId = response.data.createTopic.id; 
        expect(response).toMatchObject({
            data: {
                createTopic: {
                    id: topicId, 
                    topic: fakeTopic
                }
            }
        })
    })
    it("get club topics", async() => {
        const response = await gCall({
            source: getClubTopics, 
            variableValues:{
                clubId
            },
            token
        })
        expect(response).toMatchObject({
            data: {
                clubTopics: [
                    {
                        id: topicId, 
                        topic: fakeTopic
                    }
                ]
            }
        }); 
    })
    it("comment on topic", async() => {
        const fakeComment = faker.random.words()
        const response = await gCall({
            source: createComment, 
            variableValues: {
                clubTopicId: topicId, 
                comment: fakeComment
            }, 
            token
        })
        expect(response.data).toBeDefined(); 
    })
    it("get topic comments", async() => {
        const response = await gCall({
            source: getComments, 
            variableValues: {
                clubTopicId: topicId
            }, 
            token
        })
        expect(response.data.topicComments).toBeDefined();  
    })

})