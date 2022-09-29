import * as AWS from 'aws-sdk';
import {DocumentClient} from 'aws-sdk/clients/dynamodb';

import { Video } from '../types/videoTypes';
import {createLogger} from '../utils/logger';
import { CreateVideoRequest, UpdateVideoRequest } from '../types/requestsTypes';

const logger = createLogger("VideoAccess");

export class VideosAccess {

    constructor (
        private readonly videosTable: string = process.env.VIDEOS_TABLE,
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly createdAtVideoIndex: string = process.env.VIDEOS_CREATED_AT_INDEX
    ){}


    async getVideos(userId: string): Promise<Array<Video>> {
        logger.info(`Getting all the videos for user: ${userId}`);

        const result = await this.docClient.query({
            TableName: this.videosTable,
            IndexName: this.createdAtVideoIndex,
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
            publicVideo: createVideoRequest.publicVideo, 
            createdAt: new Date().toISOString()
        }
        
        await this.docClient.put({
            TableName: this.videosTable,
            Item: newVideo
        }).promise();

        return newVideo;
    }

    async updateVideo(userId: string, videoId: string, updateVideoRequest: UpdateVideoRequest): Promise<Video> {
        logger.info(`Updating video with id: ${videoId}`);

        const result = await this.docClient.update({
            TableName: this.videosTable,
            Key: {
                userId: userId,
                videoId: videoId
            },
            UpdateExpression: 'set name = :name, publicVideo = :publicVideo',
            ExpressionAttributeValues: {
                ':name': updateVideoRequest.name,
                ':publicVideo': updateVideoRequest.publicVideo
            },
            ReturnValues: 'ALL_NEW'
        }).promise();

        const updatedVideo: Video = result.Attributes as Video;

        return updatedVideo;
    }

    async deleteVideo(userId: string, videoId: string): Promise<Video> {
        logger.info(`Deleting video with id: ${videoId} for user: ${userId}`);

        const result = await this.docClient.delete({
            TableName: this.videosTable,
            Key: {
                userId: userId,
                videoId: videoId
            },
            ReturnValues: 'ALL_OLD'
        }).promise();

        const deletedVideo: Video = result.Attributes as Video;
        return deletedVideo;
    }


    async videoExists(userId: string, videoId: string): Promise<boolean> {
        logger.info(`Checking if video with id: ${videoId} exists for user: ${userId}`);

        const result = await this.docClient.query({
            TableName: this.videosTable,
            KeyConditionExpression: 'userId = :userId AND videoId = :videoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':videoId': videoId
            }
        }).promise();

        return !!result.Count;
    }
}