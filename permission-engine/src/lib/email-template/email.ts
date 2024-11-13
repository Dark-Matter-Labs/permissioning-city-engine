import { Language } from '../type';
import { EmailTemplate } from './email-template.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Email implements EmailTemplate {
  language: Language;
  name: string;
  subject: string;
  html: string;
  text: string;
  color: {
    platform: string;
    text: string;
  };

  constructor(option: { language: Language }) {
    this.language = option.language ?? Language.en;
    this.color = {
      platform: '#FF8F1B',
      text: '#333',
    };
  }

  subjectPart() {
    return '';
  }

  htmlPart() {
    return '';
  }

  textPart() {
    return '';
  }

  decorateHtmlPart(html: string) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${this.subject}</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: ${this.color.text};
                  padding: 20px;
              }
              h1 {
                  color: ${this.color.platform};
              }
              a {
                  color: ${this.color.platform};
                  text-decoration: none;
              }
              a:hover {
                  text-decoration: underline;
              }
          </style>
      </head>
      <body>
        <div class="content">
          ${html}
        </div>
      </body>
      </html>
    `;
  }

  build() {
    const data = {
      subject: this.subject,
      html: this.html,
      text: this.text,
    };

    return JSON.parse(JSON.stringify(data));
  }
}
