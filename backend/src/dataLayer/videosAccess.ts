import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import {DocumentClient} from 'aws-sdk/clients/dynamodb';

import { Video } from '../types/videoTypes';
import {createLogger} from '../utils/logger';
import { CreateVideoRequest, UpdateVideoRequest } from '../types/requestsTypes';

const logger = createLogger("VideoAccess");


const XAWS = AWSXRay.captureAWS(AWS)

export class VideosAccess {

    constructor (
        private readonly videosTable: string = process.env.VIDEOS_TABLE,
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly createdAtVideoIndex: string = process.env.VIDEOS_CREATED_AT_INDEX,
        private readonly publicGSIIndex: string = process.env.PUBLIC_INDEX,
        private readonly videosBucket: string = process.env.VIDEOS_S3_BUCKET
    ){}


    async getVideos(userId: string): Promise<Array<Video>> {
        logger.info(`Getting all the videos for user: ${userId}`);

        const resultUser = await this.docClient.query({
            TableName: this.videosTable,
            IndexName: this.createdAtVideoIndex,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        const resultPublic = await this.docClient.query({
            TableName: this.videosTable,
            IndexName: this.publicGSIIndex,
            FilterExpression: 'userId <> :userId',
            KeyConditionExpression: "publicVideo = :t",
            ExpressionAttributeValues: {
                ':t': 'y',
                ':userId': userId
            }
        }).promise();

        const videosUser: Array<Video> = resultUser.Items as Array<Video>;
        const videosPublic: Array<Video> = resultPublic.Items as Array<Video>

        const videos: Array<Video> = videosUser.concat(videosPublic);

        return videos;
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

    async attachFileToVideo(userId: string, videoId: string): Promise<Video> {
        logger.info(`Attaching file to video: ${videoId} for ${userId}`);

        const result = await this.docClient.update({
            TableName: this.videosTable,
            Key: {
                userId: userId,
                videoId: videoId
            },
            UpdateExpression: 'set videoUrl = :videoUrl',
            ExpressionAttributeValues: {
                ':videoUrl': `https://${this.videosBucket}.s3.amazonaws.com/${videoId}`
            },
            ReturnValues: 'ALL_NEW'
        }).promise();

        const newVideo: Video = result.Attributes as Video;

        return newVideo;
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