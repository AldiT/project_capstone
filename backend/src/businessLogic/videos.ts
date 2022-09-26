import {Video} from '../types/videoTypes';
import { VideosAccess } from '../dataLayer/videosAccess';
import {CreateVideoRequest} from '../types/requestsTypes';

import * as uuid from 'uuid';


const videosAccess: VideosAccess = new VideosAccess();

export async function getVideos(userId: string): Promise<Array<Video>> {
    return videosAccess.getVideos(userId);
}

export async function createVideo(userId: string, createVideoRequest: CreateVideoRequest): Promise<Video> {
    const videoId: string = uuid.v4();

    return videosAccess.createVideo(userId, videoId, createVideoRequest);
}