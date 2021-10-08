import { Query, Resolver, Arg, Authorized } from "type-graphql";
import { ApiService } from "../services/ApiService";
import { ApiServiceSearchResponse } from "../types/ApiServiceResponse"

@Resolver()
export class ApiServiceResolver {

    @Authorized()
    @Query(() => [ApiServiceSearchResponse], {nullable: true})
    async apiServiceSearch(
        @Arg("searchTerm") searchTerm: string, 
        @Arg("route") route: string
    ): Promise<ApiServiceSearchResponse[]> | null {
        const searchResult = await ApiService.search(searchTerm, route); 
        return searchResult; 
    }

    @Authorized()
    @Query(() => ApiServiceSearchResponse, {nullable: true})
    async findByISBN(
        @Arg("isbn") isbn: string
    ): Promise<ApiServiceSearchResponse> {
        const searchResultByIsbn = await ApiService.findWitIsbn(isbn); 
        return searchResultByIsbn; 
    }
}