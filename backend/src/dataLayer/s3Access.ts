import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger("S3AccessUtils");

// TODO: Implement the fileStogare logic
const S3 = new XAWS.S3({signatureVersion: 'v4'});

const videosBucket: string = process.env.VIDEOS_S3_BUCKET;
const signedUrlExpiration: number = Number(process.env.SIGNED_URL_EXPIRATION);

export async function getS3UploadUrl(videoId: string): Promise<string> {
    logger.info("Creating url for video: ", videoId);

    return S3.getSignedUrl('putObject', {
        Bucket: videosBucket,
        Key: videoId,
        Expires: signedUrlExpiration
    });
}