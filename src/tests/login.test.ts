import { Connection } from "typeorm";
import { gCall } from "../test-utils/gCall";
import { testConn } from "../test-utils/testConn"
import * as faker from "faker"
import { User } from "../entity/User";
import * as bcrypt from "bcrypt"; 
import * as dotenv from "dotenv"; 
dotenv.config()
let conn: Connection; 

beforeAll(async() => {
   conn = await testConn(); 
})

afterAll(async() => {
    await conn.close()
})

const loginMutation = 
`mutation Login($username:String!, $password:String!){
    login(username: $username, password: $password){
      accessToken
    }
  }
  `

describe("Login", () => {
    it("log in an existing user", async() => {
        const plainPassword = faker.internet.password(); 
        const hashedPassword = await bcrypt.hash(plainPassword, 12); 
        const user = await User.create({
            username: faker.name.firstName(),
            email: faker.internet.email(), 
            password: hashedPassword, 
            confirmed: true
        }).save(); 
        const response = await gCall({
            source: loginMutation, 
            variableValues: {
                username: user.username,
                password: plainPassword
            }
        })
        expect(response.data.login.accessToken).toBeDefined(); 
    })
})