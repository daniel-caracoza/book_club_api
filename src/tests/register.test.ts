import { Connection } from "typeorm";
import { gCall } from "../test-utils/gCall";
import { testConn } from "../test-utils/testConn"
import * as faker from "faker"
import { User } from "../entity/User";
let conn: Connection; 

beforeAll(async() => {
   conn = await testConn(); 
})

afterAll(async() => {
    await conn.close()
})

const registerMutation = 
`mutation Register($username:String!, $email:String!, $password:String!){
    register(username: $username, email: $email, password: $password){
      username
    }
  }
  `

describe("Register", () => {
    it("create a new user", async() => {
        const user = User.create({
            username: faker.name.firstName(),
            email: faker.internet.email(), 
            password: faker.internet.password()
        })
        const response = await gCall({
            source: registerMutation, 
            variableValues: {
                username: user.username,
                email: user.email,  
                password: user.password
            }
        })
        expect(response).toMatchObject({
            data: {
                register: {
                    username: user.username
                }
            }
        })
        const isUserDefined = await User.findOne({where: {username: user.username}})
        expect(isUserDefined).toBeDefined(); 
    })
})