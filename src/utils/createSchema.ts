import { buildSchema } from "type-graphql"
import { UserResolver } from "../resolvers/UserResolver"
import { ClubResolver } from "../resolvers/ClubResolver"
import { customAuthChecker } from "../auth/auth"
import { ApiServiceResolver } from "../resolvers/ApiServiceResolver"
import { BookResolver } from "../resolvers/BookResolver"
export const createSchema = async() => {
    return buildSchema({
        resolvers: [UserResolver, ClubResolver, ApiServiceResolver, BookResolver],
        authChecker: customAuthChecker
    })
}