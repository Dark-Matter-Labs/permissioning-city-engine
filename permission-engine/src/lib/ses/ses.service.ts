import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { Logger } from '../logger/logger.service';
import { EmailTemplate } from '../email-template';

@Injectable()
export class SESService {
  private sesClient: SESClient;
  private emailFrom: string;

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
    this.emailFrom = this.configService.get<string>('EMAIL_FROM'); // Make sure the email is verified in SES
  }

  async send(to: string, email: EmailTemplate) {
    const command = new SendEmailCommand({
      Source: this.emailFrom,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Text: { Data: email.text },
          Html: { Data: email.html },
        },
        Subject: {
          Data: email.subject,
          Charset: 'UTF-8',
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
