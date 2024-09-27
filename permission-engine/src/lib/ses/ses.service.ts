import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { Logger } from '../logger/logger.service';

@Injectable()
export class SESService {
  private sesClient: SESClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.sesClient = new SESClient({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async send(to: string, subject: string, body: string) {
    const command = new SendEmailCommand({
      Source: this.configService.get<string>('EMAIL_FROM'), // Make sure the email is verified in SES
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Data: body,
          },
        },
        Subject: {
          Data: subject,
        },
      },
    });

    try {
      const result = await this.sesClient.send(command);
      this.logger.log('Email sent successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw error;
    }
  }
}
