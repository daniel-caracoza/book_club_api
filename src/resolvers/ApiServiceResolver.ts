import { Query, Resolver, Arg, Authorized, Int } from "type-graphql";
import { ApiService } from "../services/ApiService";
import { ApiServiceSearchResponse } from "../types/ApiServiceResponse"

@Resolver()
export class ApiServiceResolver {

    @Authorized()
    @Query(() => [ApiServiceSearchResponse], {nullable: true})
    async apiServiceSearch(
        @Arg("searchTerm") searchTerm: string, 
        @Arg("route") route: string, 
        @Arg("page", type => Int) page: number
    ): Promise<ApiServiceSearchResponse[]> | null {
        const searchResult = await ApiService.search(searchTerm, route, page);
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