import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import 'source-map-support/register'

import * as middy from 'middy';
import {cors} from 'middy/middlewares'
import { createLogger } from "../../utils/logger"; 
import { getVideos } from "../../businessLogic/videos";
import {parseUserId, getToken} from '../../utils/authUtils';

const logger = createLogger("HttpGetVideos");

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        try{
            const token = getToken(event);
            const userId = parseUserId(token);

            const videos = await getVideos(userId);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    items: videos
                })
            }  
        }catch(e){
            logger.error(`Error trying to get the videos: ${e}`);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Error trying to get the videos!"
                })
            }  
        }
        
    }
) 

handler.use(cors({
    credentials: true
}))