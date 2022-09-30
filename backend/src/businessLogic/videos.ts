import {Video} from '../types/videoTypes';
import { VideosAccess } from '../dataLayer/videosAccess';
import {CreateVideoRequest, UpdateVideoRequest} from '../types/requestsTypes';

import * as uuid from 'uuid';
import {createLogger} from '../utils/logger';
import {getS3UploadUrl} from '../dataLayer/s3Access';


export interface UploadVideoFileResponse {
    video: Video
    uploadUrl: string
}


const videosAccess: VideosAccess = new VideosAccess();
const logger = createLogger("VideosBusinessLayer");

export async function getVideos(userId: string): Promise<Array<Video>> {
    logger.info(`Getting all the videos for user: ${userId}`);
    const videos: Array<Video> = await videosAccess.getVideos(userId);
    return videos;
}

export async function createVideo(userId: string, createVideoRequest: CreateVideoRequest): Promise<Video> {
    logger.info(`Creating a video for user: ${userId}`);
    const videoId: string = uuid.v4();
    const newVideo: Video = await videosAccess.createVideo(userId, videoId, createVideoRequest);
    return newVideo;
}

export async function updateVideo(userId: string, videoId: string, updateVideoRequest: UpdateVideoRequest): Promise<Video> {
    logger.info(`Updating video: ${videoId} for user: ${userId}`);
    const updatedVideo: Video = await videosAccess.updateVideo(userId, videoId, updateVideoRequest)

    return updatedVideo;
}

export async function deleteVideo(userId: string, videoId: string): Promise<Video>{
    logger.info(`Deleting video: ${videoId} for user: ${userId}`);
    const deletedVideo: Video = await videosAccess.deleteVideo(userId, videoId);

    return deletedVideo;
}

export async function uploadVideoFile(userId: string, videoId: string): Promise<UploadVideoFileResponse> {
    logger.info(`Uploading the video mp4 file to ${videoId} for user ${userId}`);
    const uploadUrl: string = await getS3UploadUrl(videoId);
    const newVideo: Video = await videosAccess.attachFileToVideo(userId, videoId);

    const response: UploadVideoFileResponse = {
        video: newVideo,
        uploadUrl: uploadUrl
    }


    return response;
}

export async function checkIfVideoExists(userId: string, videoId: string): Promise<boolean> {
    logger.info(`Checking if videoId: ${videoId} exists for user: ${userId}`);
    const exists: boolean = await videosAccess.videoExists(userId, videoId);
    return exists;
}