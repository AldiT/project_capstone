import {Video} from '../types/videoTypes';
import { VideosAccess } from '../dataLayer/videosAccess';
import {CreateVideoRequest, UpdateVideoRequest} from '../types/requestsTypes';

import * as uuid from 'uuid';


const videosAccess: VideosAccess = new VideosAccess();

export async function getVideos(userId: string): Promise<Array<Video>> {
    const videos: Array<Video> = await videosAccess.getVideos(userId);

    return videos;
}

export async function createVideo(userId: string, createVideoRequest: CreateVideoRequest): Promise<Video> {
    const videoId: string = uuid.v4();
    const newVideo: Video = await videosAccess.createVideo(userId, videoId, createVideoRequest);
    return newVideo;
}

export async function updateVideo(userId: string, videoId: string, updateVideoRequest: UpdateVideoRequest): Promise<Video> {
    const updatedVideo: Video = await videosAccess.updateVideo(userId, videoId, updateVideoRequest)

    return updatedVideo;
}

export async function deleteVideo(userId: string, videoId: string): Promise<Video>{
    const deletedVideo: Video = await videosAccess.deleteVideo(userId, videoId);

    return deletedVideo;
}

export async function checkIfVideoExists(userId: string, videoId: string): Promise<boolean> {
    const exists: boolean = await videosAccess.videoExists(userId, videoId);
    return exists;
}