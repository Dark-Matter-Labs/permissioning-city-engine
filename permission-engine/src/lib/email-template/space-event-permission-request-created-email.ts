import { Language } from '../type';
import { Email } from './email';
import { I18nService } from 'nestjs-i18n';

export class SpaceEventPermissionRequestCreatedEmail extends Email {
  language: Language;
  name: string;
  spaceName: string;
  timeoutAt: string;
  spaceEventId: string;
  eventDashboardLink: string;

  subject: string;
  html: string;
  text: string;

  constructor(
    private readonly i18n: I18nService,
    option: {
      language: Language;
      name: string;
      spaceName: string;
      timeoutAt: string;
      spaceEventId: string;
    },
  ) {
    super(option);
    this.name = option.name;
    this.spaceName = option.spaceName;
    this.timeoutAt = option.timeoutAt;
    this.spaceEventId = option.spaceEventId;
    this.eventDashboardLink =
      process.env.GOOGLE_CALLBACK_DOMAIN + `/event/${this.spaceEventId}`;

    this.subjectPart();
    this.htmlPart();
    this.textPart();

    return this.build();
  }

  subjectPart() {
    this.subject = this.i18n.translate(
      'email.spaceEventPermissionRequestCreated.subject',
      {
        lang: this.language,
        args: {},
      },
    );

    return this.subject;
  }

  htmlPart() {
    const html = this.i18n.translate(
      'email.spaceEventPermissionRequestCreated.html',
      {
        lang: this.language,
        args: {
          name: this.name,
          spaceName: this.spaceName,
          timeoutAt: this.timeoutAt,
          eventDashboardLink: this.eventDashboardLink,
        },
      },
    );

    this.html = this.decorateHtmlPart(html);

    return this.html;
  }

  textPart() {
    this.text = this.i18n.translate(
      'email.spaceEventPermissionRequestCreated.text',
      {
        lang: this.language,
        args: {
          name: this.name,
          spaceName: this.spaceName,
          timeoutAt: this.timeoutAt,
          eventDashboardLink: this.eventDashboardLink,
        },
      },
    );

    return this.text;
  }
}
