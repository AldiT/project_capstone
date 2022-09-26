import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import 'source-map-support/register';
import * as middy from 'middy';
import {cors} from 'middy/middlewares';


import { createLogger } from "../../utils/logger";
import {createVideo} from '../../businessLogic/videos';
import { getToken, parseUserId } from "../../utils/authUtils";
import { CreateVideoRequest } from "../../types/requestsTypes";


const logger = createLogger("HttpCreateVideo")


export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info(`Processing create video request with event: \n${event}`);

        try{
            const token = getToken(event);
            const userId = parseUserId(token);

            const createVideoRequest: CreateVideoRequest = JSON.parse(event.body);

            const newVideo = await createVideo(userId, createVideoRequest);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    item: newVideo
                })
            }
        }catch(e){
            logger.error(`Error happened while trying to create a Video: \n${e}`);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Error while trying to create the video!"
                })
            }
        }

    }
)

handler.use(cors({
    credentials: true
}))