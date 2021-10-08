import * as dotenv from "dotenv"; 
import "reflect-metadata";
import * as express from "express";
import { createServer } from "http";
import { execute, subscribe } from "graphql"
import { SubscriptionServer } from "subscriptions-transport-ws"; 
import {createConnection} from "typeorm";
import {ApolloServer} from "apollo-server-express"; 
import { authenticateSubscription} from "./auth/auth";
import * as cookieParser from "cookie-parser"; 
import { User } from "./entity/User";
import { createSchema } from "./utils/createSchema";
import {redis} from "./redis"; 


(async() => {
    dotenv.config(); 
    await createConnection(); 
    const app = express();
    app.use(cookieParser()); 

    app.get("/user/confirm/:token", async(req, res) => {
        const {token} = req.params; 
        const userId = await redis.get(token); 
        if(!userId){
            res.status(403).send()
        } 
        await User.update({id: parseInt(userId)}, {confirmed: true}); 
        await redis.del(token)
        res.status(200).send("Email has been confirmed"); 

    })

    const schema = await createSchema()
    const apolloServer = new ApolloServer({
        schema,
        context: ({req: Request, res: Response}) => ({req: Request, res: Response}), 
        subscriptions: {
            path: "/subscriptions"
        }
    }); 
    apolloServer.applyMiddleware({app});
    const server = createServer(app); 
    server.listen(4000, async() => {
        new SubscriptionServer({
            execute, 
            subscribe, 
            schema, 
            onConnect: async(connectionParams, webSocket) => {
                await authenticateSubscription(connectionParams, webSocket)
            }
        }, {
            server, 
            path: "/subscriptions"
        })
        console.log("listening on http://localhost:4000/graphql")
    })

})();