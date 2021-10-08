import axios, { AxiosResponse } from "axios"
import { ApiServiceSearchResponse } from "../types/ApiServiceResponse"

export abstract class ApiService {
    static url: string = "https://api2.isbndb.com"

    static async search(searchTerm: string, route: string): Promise<Array<ApiServiceSearchResponse>>{
        try {
            const response = await axios.get(`${this.url}/${route}/${searchTerm}`, {
                params: {
                    page: 1, 
                    pageSize: 10, 
                    column: "title"
                }, 
                headers: {
                    Authorization: process.env.API_KEY
                }
            })
            const books: Array<ApiServiceSearchResponse> = mapto(response); 
            return books; 
        } catch (error){
            console.log(error.message); 
        }
    }

    static async findWitIsbn(isbn: string): Promise<ApiServiceSearchResponse> {
        try {
            const response = await axios.get(`${this.url}/book/${isbn}`, { 
                headers: {
                    Authorization: process.env.API_KEY
                }
            })
            const item = response.data.book; 
            const book: ApiServiceSearchResponse = new ApiServiceSearchResponse(
                item.title, 
                item.image, 
                item.publisher,
                item.isbn13,  
                item.synopsys, 
                item.pages, 
                item.authors
            )
            return book; 
        } catch (error){
            console.log(error.message); 
        }
    }
}

function mapto(items: AxiosResponse): Array<ApiServiceSearchResponse> {
    const books: Array<ApiServiceSearchResponse> = new Array<ApiServiceSearchResponse>();
    for (const item of items.data.books){
        const searchResponse = new ApiServiceSearchResponse(
            item.title, 
            item.image, 
            item.publisher,
            item.isbn13,  
            item.synopsys, 
            item.pages, 
            item.authors
        )
        books.push(searchResponse); 
    }
    return books; 
}