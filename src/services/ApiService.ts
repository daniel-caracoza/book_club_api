import axios from "axios"
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
            const books: Array<ApiServiceSearchResponse> = new Array<ApiServiceSearchResponse>();
            for (const item of response.data.books){
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
        } catch (error){
            console.log(error.message); 
        }
    }
}