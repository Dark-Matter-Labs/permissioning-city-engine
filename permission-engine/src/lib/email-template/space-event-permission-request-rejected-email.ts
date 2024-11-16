import { Language } from '../type';
import { Email } from './email';
import { I18nService } from 'nestjs-i18n';

export class SpaceEventPermissionRequestRejectedEmail extends Email {
  language: Language;
  subject: string;
  html: string;
  text: string;

  name: string;
  eventId: string;
  eventTitle: string;
  excitements: string[];
  worries: string[];
  conditions: string[];
  eventDashboardLink: string;

  constructor(
    private readonly i18n: I18nService,
    option: {
      language: Language;
      name: string;
      eventId: string;
      eventTitle: string;
      excitements: string[];
      worries: string[];
      conditions: string[];
    },
  ) {
    super(option);

    this.name = option.name;
    this.eventTitle = option.eventTitle;
    this.excitements = option.excitements;
    this.worries = option.worries;
    this.conditions = option.conditions;
    // TODO. Check routing policy in FrontEnd
    this.eventDashboardLink = `${this.domain}/event/${this.eventId}`;

    this.subjectPart();
    this.htmlPart();
    this.textPart();

    return this.build();
  }

  subjectPart() {
    this.subject = this.i18n.translate(
      'email.spaceEventPermissionRequestRejected.subject',
      {
        lang: this.language,
        args: {},
      },
    );

    return this.subject;
  }

  htmlPart() {
    const permissionResponseSummary = this.i18n.translate(
      'summary.permissionResponseSummary.html',
      {
        lang: this.language,
        args: {
          excitements: this.excitements
            .map((item) => `<li>${item}</li>`)
            .join(),
          worries: this.worries.map((item) => `<li>${item}</li>`).join(),
          conditions: this.conditions.map((item) => `<li>${item}</li>`).join(),
        },
      },
    );
    const html = this.i18n.translate(
      'email.spaceEventPermissionRequestRejected.html',
      {
        lang: this.language,
        args: {
          name: this.name,
          eventTitle: this.eventTitle,
          permissionResponseSummary,
          eventDashboardLink: this.eventDashboardLink,
        },
      },
    );

    this.html = this.decorateHtmlPart(html);

    return this.html;
  }

  textPart() {
    const permissionResponseSummary = this.i18n.translate(
      'summary.permissionResponseSummary.html',
      {
        lang: this.language,
        args: {
          excitements: this.excitements.map((item) => `* ${item}`).join('\n'),
          worries: this.worries.map((item) => `* ${item}`).join('\n'),
          conditions: this.conditions.map((item) => `* ${item}`).join('\n'),
        },
      },
    );
    this.text = this.i18n.translate(
      'email.spaceEventPermissionRequestRejected.text',
      {
        lang: this.language,
        args: {
          name: this.name,
          eventTitle: this.eventTitle,
          permissionResponseSummary,
          eventDashboardLink: this.eventDashboardLink,
        },
      },
    );

    return this.text;
  }
}
