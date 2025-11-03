import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { promisify } from 'util';

const randomBytes = promisify(crypto.randomBytes);

let s3Client;

const getS3Client = () => {
    if (!s3Client) {
        const region = process.env.AWS_REGION;
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

        if (!region || !accessKeyId || !secretAccessKey) {
            console.error("Missing AWS credentials in environment variables.");
            throw new Error('Server is missing required AWS configuration.');
        }

        s3Client = new S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }
    return s3Client;
};

export async function uploadToS3(base64Data, contentType, fileName) {
  const bucketName = process.env.S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;

  if (!bucketName) {
      console.error("Missing S3_BUCKET_NAME in environment variables.");
      throw new Error('Server is not configured for file uploads.');
  }

  const s3 = getS3Client();
  
  const rawBytes = await randomBytes(16);
  const objectKey = rawBytes.toString('hex');
  const extension = fileName.split('.').pop() || 'bin';
  const keyWithExtension = `${objectKey}.${extension}`;

  const buffer = Buffer.from(base64Data, 'base64');

  const params = {
      Bucket: bucketName,
      Key: keyWithExtension,
      Body: buffer,
      ContentType: contentType,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${keyWithExtension}`;
  return imageUrl;
}