import * as AWS from 'aws-sdk';
import * as XAWS from 'aws-xray-sdk';
import {DocumentClient} from 'aws-sdk/clients/dynamodb';

import { Video } from '../types/videoTypes';
import {createLogger} from '../utils/logger';
import { CreateVideoRequest } from '../types/requestsTypes';

const logger = createLogger("VideoAccess");

export class VideosAccess {

    constructor (
        private readonly videosTable: string = process.env.VIDEOS_TABLE,
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient()
    ){}


    async getVideos(userId: string): Promise<Array<Video>> {
        logger.info(`Getting all the videos for user: ${userId}`);

        const result = await this.docClient.query({
            TableName: this.videosTable,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        const videos: Array<Video> = result.Items as Array<Video>;

        return videos
    }

    async createVideo(userId: string, videoId: string, createVideoRequest: CreateVideoRequest): Promise<Video> {
        logger.info(`Creating new video with id: ${videoId}`);

        const newVideo: Video = {
            userId: userId,
            videoId: videoId,
            name: createVideoRequest.name,
            createdAt: new Date().toISOString(),
            public: false
        }
        
        const result = await this.docClient.put({
            TableName: this.videosTable,
            Item: newVideo
        }).promise();

        return newVideo;
    }
}