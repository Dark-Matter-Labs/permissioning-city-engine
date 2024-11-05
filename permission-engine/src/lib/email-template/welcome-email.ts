import { I18nService } from 'nestjs-i18n';
import { Language } from '../type';
import { Injectable } from '@nestjs/common';
import { Email } from './email';

@Injectable()
export class WelcomeEmail extends Email {
  language: Language;
  name: string;
  subject: string;
  html: string;
  text: string;
  howToGuideLink: string;
  platformName: string;

  constructor(
    private readonly i18n: I18nService,
    option: { language: Language; name: string },
  ) {
    super(option);
    this.name = option.name;
    this.howToGuideLink = 'https://engine.permissioning.city/how-to-guide';
    this.platformName = this.i18n.translate('dictionary.platform.name', {
      lang: this.language,
    });

    this.subjectPart();
    this.htmlPart();
    this.textPart();

    return this.build();
  }

  subjectPart() {
    this.subject = this.i18n.translate('email.welcome.subject', {
      lang: this.language,
      args: { name: this.name, platformName: this.platformName },
    });

    return this.subject;
  }

  htmlPart() {
    const html = this.i18n.translate('email.welcome.html', {
      lang: this.language,
      args: {
        name: this.name,
        platformName: this.platformName,
        howToGuideLink: this.howToGuideLink,
      },
    });

    this.html = this.decorateHtmlPart(html);

    return this.html;
  }

  textPart() {
    this.text = this.i18n.translate('email.welcome.text', {
      lang: this.language,
      args: {
        name: this.name,
        platformName: this.platformName,
        howToGuideLink: this.howToGuideLink,
      },
    });

    return this.text;
  }
}
