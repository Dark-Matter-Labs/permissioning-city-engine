import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
import { Logger } from '../logger/logger.service';

@Injectable()
export class SlackService {
  private webhookUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    // Load the Slack webhook URL from environment variables
    this.webhookUrl = this.configService.get<string>('SLACK_WEBHOOK_URL');
  }

  async sendMessage(message: string): Promise<AxiosResponse<any>> {
    const payload = {
      text: message,
    };

    try {
      const response = await lastValueFrom(
        this.httpService.post(this.webhookUrl, payload),
      );
      return response;
    } catch (error) {
      this.logger.error('Error sending message to Slack:', error);
      throw error;
    }
  }
}
