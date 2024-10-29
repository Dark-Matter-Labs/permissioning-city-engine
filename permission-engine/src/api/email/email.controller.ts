import {
  Controller,
  UseGuards,
  Headers,
  Req,
  Body,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Logger } from 'src/lib/logger/logger.service';
import * as crypto from 'crypto';
import * as https from 'https';
import { UserService } from '../user/user.service';

@ApiTags('email')
@Controller('api/v1/email')
export class EmailController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly logger: Logger,
  ) {}

  @Post('bounce')
  @ApiExcludeEndpoint()
  async bounce(
    @Req() req,
    @Body() body: any,
    @Headers('x-amz-sns-message-type') messageType: string,
  ) {
    // Validate that the message is from SNS
    const isValid = await this.verifySnsMessage(body);
    if (!isValid) {
      this.logger.log('Invalid SNS message signature');
      throw new BadRequestException('Invalid SNS message signature');
    }

    // Handle subscription confirmation
    if (messageType === 'SubscriptionConfirmation') {
      const subscribeUrl = body.SubscribeURL;
      this.logger.log(`Confirming subscription with URL: ${subscribeUrl}`);

      // Make an HTTP request to the SubscribeURL to confirm the subscription
      const response = await this.emailService.firstValueFrom(subscribeUrl);
      this.logger.log(`Subscription confirmed: ${response.status}`);
    }

    // Handle notifications
    if (messageType === 'Notification') {
      const message = body.Message;
      if (message.notificationType === 'Bounce') {
        this.logger.log(`Received notification: ${message}`);
        // Process the notification message as needed
        await this.emailService.bounce(message);
      }
    }
  }

  @Post('complaint')
  @ApiExcludeEndpoint()
  async complaint(
    @Req() req,
    @Body() body: any,
    @Headers('x-amz-sns-message-type') messageType: string,
  ) {
    // Validate that the message is from SNS
    const isValid = await this.verifySnsMessage(body);
    if (!isValid) {
      this.logger.log('Invalid SNS message signature');
      throw new BadRequestException('Invalid SNS message signature');
    }

    // Handle subscription confirmation
    if (messageType === 'SubscriptionConfirmation') {
      const subscribeUrl = body.SubscribeURL;
      this.logger.log(`Confirming subscription with URL: ${subscribeUrl}`);

      // Make an HTTP request to the SubscribeURL to confirm the subscription
      const response = await this.emailService.firstValueFrom(subscribeUrl);
      this.logger.log(`Subscription confirmed: ${response.status}`);
    }

    // Handle notifications
    if (messageType === 'Notification') {
      const message = body.Message;
      if (message.notificationType === 'Complaint') {
        this.logger.log(`Received notification: ${message}`);
        // Process the notification message as needed
        await this.emailService.complaint(message);
      }
    }
  }

  @Post('delivery')
  @ApiExcludeEndpoint()
  async delivery(
    @Req() req,
    @Body() body: any,
    @Headers('x-amz-sns-message-type') messageType: string,
  ) {
    // Validate that the message is from SNS
    const isValid = await this.verifySnsMessage(body);
    if (!isValid) {
      this.logger.log('Invalid SNS message signature');
      throw new BadRequestException('Invalid SNS message signature');
    }

    // Handle subscription confirmation
    if (messageType === 'SubscriptionConfirmation') {
      const subscribeUrl = body.SubscribeURL;
      this.logger.log(`Confirming subscription with URL: ${subscribeUrl}`);

      // Make an HTTP request to the SubscribeURL to confirm the subscription
      const response = await this.emailService.firstValueFrom(subscribeUrl);
      this.logger.log(`Subscription confirmed: ${response.status}`);
    }

    // Handle notifications
    if (messageType === 'Notification') {
      const message = body.Message;
      if (message.notificationType === 'Delivery') {
        this.logger.log(`Received notification: ${message}`);
        // Process the notification message as needed
        await this.emailService.delivery(message);
      }
    }
  }

  @Post('unsubscribe')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Unsubscribe user email notification' })
  async unsubscribe(@Req() req): Promise<{ data: { result: boolean } }> {
    return await this.userService.update(req.user.email, {
      isSubscribe: false,
    });
  }

  // Method to validate the SNS message signature
  private async verifySnsMessage(body: any): Promise<boolean> {
    // Get the signing certificate URL
    const certUrl = body.SigningCertURL;
    if (!certUrl) {
      return false;
    }

    try {
      // Download the signing certificate from AWS
      const cert = await this.downloadCertificate(certUrl);

      // Construct the message that was signed
      const stringToSign = this.buildStringToSign(body);

      // Verify the signature using the certificate
      const verifier = crypto.createVerify('sha1WithRSAEncryption');
      verifier.update(stringToSign);

      // Decode the signature from base64
      const signature = Buffer.from(body.Signature, 'base64');

      // Validate the signature using the public key from the certificate
      return verifier.verify(cert, signature);
    } catch (error) {
      this.logger.error(
        `Error verifying SNS signature: ${error.message}`,
        error,
      );
      return false;
    }
  }

  // Helper method to build the string that was signed
  private buildStringToSign(body: any): string {
    const keys =
      body.Type === 'Notification'
        ? ['Message', 'MessageId', 'Subject', 'Timestamp', 'TopicArn', 'Type']
        : [
            'Message',
            'MessageId',
            'SubscribeURL',
            'Timestamp',
            'Token',
            'TopicArn',
            'Type',
          ];

    return keys
      .filter((key) => body[key])
      .map((key) => `${key}\n${body[key]}`)
      .join('');
  }

  // Helper method to download the certificate from the provided URL
  private downloadCertificate(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let certData = '';
        res.on('data', (chunk) => (certData += chunk));
        res.on('end', () => resolve(certData));
        res.on('error', (err) => reject(err));
      });
    });
  }
}
