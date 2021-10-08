import { Connection } from "typeorm";
import { gCall } from "../test-utils/gCall";
import { testConn } from "../test-utils/testConn"
import * as dotenv from "dotenv"; 
import { BookInput } from "../types/BookInput";
import {User} from "../entity/User";
import {Book} from "../entity/Book"; 
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
        currentPage
    }
}
`

describe("Test adding to a user reading list", () => {
    const bookInput = new BookInput(); 
    bookInput.id = "12345";
    bookInput.author = "Daniel"; 
    bookInput.bookTitle = "my book";
    bookInput.image="image.jpg";
    let user; 
    let token; 
    let book2; 
    it("add a book to a reading list", async() => {
        user = await User.create({
            username: faker.name.firstName(),
            email: faker.internet.email(), 
            password: faker.internet.password(),
            books: new Array<Book>()
        }).save();
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

    it("add a second book to a reading list", async() => {
        book2 = new BookInput(); 
        book2.id = "45678"; 
        book2.author = "stuff"; 
        book2.bookTitle = "more stuff"
        book2.image="image2.jpg"
        const response = await gCall({
            source: addToReadingListMutation, 
            variableValues: {
                book: book2
            },
            id: user.id, 
            token
        })
        expect(response).toMatchObject({
            data: {
                addToReadingList: {
                    bookTitle: book2.bookTitle, 
                    author: book2.author,
                    image: book2.image
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
                        currentPage: 0,
                        image: bookInput.image
                    }, 
                    {
                        bookTitle: book2.bookTitle, 
                        author: book2.author, 
                        currentPage: 0,
                        image: book2.image
                    }
                ]
            }
        })
    })
})