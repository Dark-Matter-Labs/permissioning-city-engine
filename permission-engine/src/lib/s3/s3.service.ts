import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import { Logger } from '../logger/logger.service';

@Injectable()
export class S3Service {
  private bucket: string;
  private s3: AWS.S3;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.bucket = this.configService.get('AWS_S3_BUCKET');
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
  }

  async uploadFile(filePath: string, key: string) {
    const fileContent = fs.readFileSync(filePath);

    // Setting up S3 upload parameters
    const params = {
      Bucket: this.bucket,
      Key: key, // File name you want to save as in S3
      Body: fileContent,
    };

    // Uploading files to the bucket
    try {
      const data = await this.s3.upload(params).promise();
      this.logger.log(`File uploaded successfully. ${data.Location}`);
    } catch (error) {
      this.logger.error('Failed to upload file', error);
    }
  }

  async uploadBuffer(buffer: Buffer, key: string) {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
    };

    try {
      const data = await this.s3.upload(params).promise();
      this.logger.log(`File uploaded successfully. ${data.Location}`);
    } catch (error) {
      this.logger.error('Failed to upload file', error);
    }
  }

  async downloadFile(key: string, downloadPath: string) {
    const params = {
      Bucket: this.bucket,
      Key: key,
    };

    try {
      const data = await this.s3.getObject(params).promise();
      if (data.Body instanceof Buffer) {
        fs.writeFileSync(downloadPath, data.Body);
        this.logger.log(`File downloaded successfully to ${downloadPath}`);
      } else {
        throw new Error('Unexpected data type for data.Body');
      }
    } catch (error) {
      this.logger.error('Failed to download file', error);
    }
  }
}
