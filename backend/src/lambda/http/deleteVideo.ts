import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import 'source-map-support/register';
import { cors } from 'middy/middlewares';

import * as middy from 'middy';
import { Video } from "../../types/videoTypes";
import { getUserId } from '../../utils/authUtils';
import { createLogger } from "../../utils/logger";
import { deleteVideo, checkIfVideoExists } from '../../businessLogic/videos';


const logger = createLogger("HttpUpdateVideo");


export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

        try{
            logger.info(`Processing the delete event: \n${event}`);
            
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

            const deletedVideo: Video = await deleteVideo(userId, videoId);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    item: deletedVideo
                })
            }
        }catch(e){
            logger.error(`Error while trying to delete the video: \n${e}`);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Error trying to delete the video."
                })
            }
        }
    }
)

handler.use(cors({
    credentials: true
}))