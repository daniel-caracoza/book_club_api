import { Connection } from "typeorm";
import { gCall } from "../test-utils/gCall";
import { testConn } from "../test-utils/testConn"
import * as dotenv from "dotenv"; 
import { BookInput } from "../types/BookInput";
import {User} from "../entity/User"
import { Book } from "../entity/Book";
import * as faker from "faker"
import { generateAccessToken } from "../auth/auth";
dotenv.config()
let conn: Connection; 

beforeAll(async() => {
   conn = await testConn(); 
})

afterAll(async() => {
    await conn.close()
})

const addToReadingListMutation = 
`mutation AddToReadingList($book: BookInput!){
    addToReadingList(book: $book){
        bookTitle
    	author
        image
    }
}`

const getUserBooks = 
`query UserBooks{
    userBooks{
        bookTitle
        author
        image
    }
}
`

describe("Test adding to a user reading list", () => {
    let token; 
    const bookInput = new BookInput(); 
    bookInput.id = 12345; 
    bookInput.author = "Daniel"; 
    bookInput.bookTitle = "my book"
    bookInput.image="image.jpg"
    it("add a book to a reading list", async() => {
        //first create a user
        const user = await User.create({
            username: faker.name.firstName(),
            email: faker.internet.email(), 
            password: faker.internet.password(),
            books: Array<Book>()
        }).save()
        token = generateAccessToken(user); 

        const response = await gCall({
            source: addToReadingListMutation, 
            variableValues: {
                book: bookInput
            },
            id: user.id, 
            token
        })
        expect(response).toMatchObject({
            data: {
                addToReadingList: {
                    bookTitle: bookInput.bookTitle, 
                    author: bookInput.author,
                    image: bookInput.image
                }
            }
        })
    })
    it("get user books", async() => {
        const response = await gCall({
            source: getUserBooks, 
            token
        })
        expect(response).toMatchObject({
            data: {
                userBooks: [
                    {
                        bookTitle: bookInput.bookTitle, 
                        author: bookInput.author, 
                        image: bookInput.image
                    }
                ]
            }
        })
    })
})