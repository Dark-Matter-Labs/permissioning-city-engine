import { Language } from '../type';
import { Email } from './email';
import { I18nService } from 'nestjs-i18n';

export class SpaceEventPermissionRequestedEmail extends Email {
  language: Language;
  name: string;
  spaceId: string;
  communityDashboardLink: string;
  subject: string;
  html: string;
  text: string;

  constructor(
    private readonly i18n: I18nService,
    option: {
      language: Language;
      name: string;
      spaceId: string;
    },
  ) {
    super(option);
    this.name = option.name;
    this.spaceId = option.spaceId;
    this.communityDashboardLink =
      process.env.GOOGLE_CALLBACK_DOMAIN + `/space/${this.spaceId}/community`;

    this.subjectPart();
    this.htmlPart();
    this.textPart();

    return this.build();
  }

  subjectPart() {
    this.subject = this.i18n.translate(
      'email.spaceEventPermissionRequested.subject',
      {
        lang: this.language,
        args: {},
      },
    );

    return this.subject;
  }

  htmlPart() {
    const html = this.i18n.translate(
      'email.spaceEventPermissionRequested.html',
      {
        lang: this.language,
        args: {
          name: this.name,
          communityDashboardLink: this.communityDashboardLink,
        },
      },
    );

    this.html = this.decorateHtmlPart(html);

    return this.html;
  }

  textPart() {
    this.text = this.i18n.translate(
      'email.spaceEventPermissionRequested.text',
      {
        lang: this.language,
        args: {
          name: this.name,
          communityDashboardLink: this.communityDashboardLink,
        },
      },
    );

    return this.text;
  }
}
