import * as dotenv from "dotenv"; 
import "reflect-metadata";
import * as express from "express";
import { createServer } from "http";
import { execute, subscribe } from "graphql"
import { SubscriptionServer } from "subscriptions-transport-ws"; 
import {createConnection} from "typeorm";
import {ApolloServer} from "apollo-server-express"; 
import { authenticateSubscription, generateRefreshToken, generateAccessToken } from "./auth/auth";
import * as cookieParser from "cookie-parser"; 
import { verify } from "jsonwebtoken";
import { sendRefreshToken } from "./auth/sendRefreshToken";
import { User } from "./entity/User";
import { createSchema } from "./utils/createSchema";
import {redis} from "./redis"; 


(async() => {
    dotenv.config(); 
    await createConnection(); 
    const app = express();
    app.use(cookieParser()); 

    app.post("/refresh", async(req, res) => {
        const refreshToken = req.cookies['jid']; 
        if(!refreshToken){
            res.status(401).send("not authenticated")
        }
        //validate token
        try {
            const payload: any = await verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            if(!payload){
                throw new Error("not authenticated")
            }
            const user = await User.findOne({where: {id: payload.userId}}) 
            sendRefreshToken(res, generateRefreshToken(user)); 
            res.status(201).send({accessToken: generateAccessToken(user)}); 

        } catch (err){
            res.status(401).send(err.message); 
        }
    })

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
        context: ({req, res}) => ({req, res}), 
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
