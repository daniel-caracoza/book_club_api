import { sign, verify } from "jsonwebtoken";
import { AuthChecker } from "type-graphql";
import { Context } from "../context.interface";
import { User } from "../entity/User";
export const generateAccessToken = (user: User): string => {
    return sign({ userId: user.id, username: user.username }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    })
}

export const generateRefreshToken = (user: User): string => {
    return sign({ userId: user.id, username: user.username }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    })
}

export const validateAccessToken = async (token: string): Promise<any> => {
    return verify(token, process.env.ACCESS_TOKEN_SECRET)
}

export const authenticateSubscription = async (connectionParams, webSocket) => {
    if (!connectionParams.authorization) {
        throw new Error("missing auth token")
    }
    const authHeader = connectionParams['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    const { userId } = await validateAccessToken(token)
    if (userId) {
        const user = await User.findOne({ where: { id: userId } });
        return {
            currentUser: user
        }
    }
}
export const customAuthChecker: AuthChecker<Context> = async ({ context }, roles) => {
    const authHeader = context.req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return false;
    }
    //verify token
    try {
        const payload = await verify(token, process.env.ACCESS_TOKEN_SECRET);
        context.payload = payload as any
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}