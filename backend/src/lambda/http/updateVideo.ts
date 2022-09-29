import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import 'source-map-support/register';
import { cors } from 'middy/middlewares';

import * as middy from 'middy';
import { Video } from "../../types/videoTypes";
import { getUserId } from '../../utils/authUtils';
import { createLogger } from "../../utils/logger";
import { UpdateVideoRequest } from "../../types/requestsTypes";
import { updateVideo, checkIfVideoExists } from '../../businessLogic/videos';


const logger = createLogger("HttpUpdateVideo");


export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

        try{
            logger.info(`Processing the update event: \n${event}`);
            const updateVideoRequest: UpdateVideoRequest = JSON.parse(event.body);
            
            const userId = getUserId(event);
            const videoId = event.pathParameters.videoId

            const exists: boolean = await checkIfVideoExists(userId, videoId);

            if (!exists) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: "The requested video not found!"
                    })
                }
            }

            const updatedVideo: Video = await updateVideo(userId, videoId, updateVideoRequest);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    item: updatedVideo
                })
            }
        }catch(e){
            logger.error(`Error while trying to update the video: \n${e}`);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Error trying to update the video."
                })
            }
        }
    }
)

handler.use(cors({
    credentials: true
}))