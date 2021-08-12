import { graphql, GraphQLSchema } from "graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { createSchema } from "../utils/createSchema";

interface Options {
    source: string; 
    variableValues?:Maybe<{
        [key: string]: any;
    }>
    id?: number;
    token?: string 
}

let schema: GraphQLSchema; 
export const gCall = async({source, variableValues, id, token}: Options) => {
    if(!schema){
        schema = await createSchema()
    }
    return graphql({
        schema, 
        source,
        variableValues, 
        contextValue: {
            req: {
                headers: {
                    authorization: `bearer ${token}`
                }
            }, 
            res: {
                cookie: jest.fn()
            },
            payload: {
                id
            }
        }
    })
}