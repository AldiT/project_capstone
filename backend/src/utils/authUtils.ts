import { decode } from 'jsonwebtoken';
import { APIGatewayTokenAuthorizerEvent, APIGatewayProxyEvent } from 'aws-lambda';

import { JwtPayload } from '../types/JwtPayload';


export function parseUserId(jwtToken: string): string {
    const decodedJwt: JwtPayload = decode(jwtToken) as JwtPayload;
    return decodedJwt.sub;
}

export function getUserId(event: APIGatewayProxyEvent): string{
    const authorization = event.headers.Authorization;
    const split = authorization.split(" ");
    const token = split[1];

    const userId = parseUserId(token);
    return userId
}

export function getToken(event: APIGatewayTokenAuthorizerEvent ): string{
    const authorization = event.authorizationToken;
    const split = authorization.split(' ');
    const token = split[1];

    return token;
}