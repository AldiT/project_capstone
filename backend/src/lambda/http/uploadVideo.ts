import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import 'source-map-support/register';

import * as middy from 'middy';
import {cors} from 'middy/middlewares';
import {createLogger} from '../../utils/logger';
import { getUserId } from '../../utils/authUtils';
import { checkIfVideoExists, uploadVideoFile, UploadVideoFileResponse } from '../../businessLogic/videos';

const logger = createLogger("HttpUploadVideo");



export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        try {
            const userId: string = getUserId(event);
            const videoId: string = event.pathParameters.videoId;

            const exists: boolean = await checkIfVideoExists(userId, videoId);
            
            if (!exists){
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: "Video with given Id not found!"
                    })
                }
            }

            const response: UploadVideoFileResponse = await uploadVideoFile(userId, videoId);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    item: response.video,
                    uploadUrl: response.uploadUrl
                })
            }
            

        }catch(e){
            logger.error(`Error while creating upload url: ${e}`)
            console.log(e);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Error while creating upload Url!"
                })
            }
        }
    }
)

handler.use(cors({
    credentials: true
}))