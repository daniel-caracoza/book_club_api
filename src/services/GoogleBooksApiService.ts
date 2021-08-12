import axios from "axios"; 
import { GoogleBooksResponse } from "../types/GoogleBooksResponse";
export abstract class GoogleBooksApiService {
    static url: string = "https://www.googleapis.com/books/v1";
    static maxResults: number = 10
    static fields: string = "items(volumeInfo/title,volumeInfo/authors,volumeInfo/description,volumeInfo/imageLinks)"  
    
    static async findBySearchTerms(searchTerm: string): Promise<Array<GoogleBooksResponse>> {
        const gbooksResponseArray: Array<GoogleBooksResponse> = new Array<GoogleBooksResponse>() 
        try {
            const response = await axios.get(`${this.url}/volumes`, 
            {
                params: {
                    q: searchTerm, 
                    maxResults: this.maxResults, 
                    fields: this.fields 
                }
            })
            const items = response.data.items; 
            for(const item of items){
                const gbooksResponse = new GoogleBooksResponse(
                    item.volumeInfo.title, 
                    item.volumeInfo.authors, 
                    item.volumeInfo.description, 
                    item.volumeInfo.imageLinks.thumbnail
                )
                gbooksResponseArray.push(gbooksResponse)
            }
            return gbooksResponseArray; 
        } catch (error){
            console.log(error); 
        }
    }

}