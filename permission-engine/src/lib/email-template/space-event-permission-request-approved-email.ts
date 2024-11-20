import { Language } from '../type';
import { Email } from './email';
import { I18nService } from 'nestjs-i18n';

export class SpaceEventPermissionRequestApprovedEmail extends Email {
  language: Language;
  subject: string;
  html: string;
  text: string;

  name: string;
  permissionRequestId: string;
  eventId: string;
  eventTitle: string;
  excitements: string[];
  worries: string[];
  conditions: string[];
  resolveLink: string;
  externalBookingLink: string;
  eventDashboardLink: string;

  constructor(
    private readonly i18n: I18nService,
    option: {
      language: Language;
      name: string;
      permissionRequestId: string;
      eventId: string;
      eventTitle: string;
      excitements: string[];
      worries: string[];
      conditions: string[];
      externalBookingLink: string;
    },
  ) {
    super(option);

    this.name = option.name;
    this.eventTitle = option.eventTitle;
    this.excitements = option.excitements;
    this.worries = option.worries;
    this.conditions = option.conditions;
    this.externalBookingLink = option.externalBookingLink;
    this.permissionRequestId = option.permissionRequestId;
    this.eventId = option.eventId;
    // TODO. Check routing policy in FrontEnd
    this.resolveLink = `${this.domain}/permission/request/${option.permissionRequestId}/resolve`;
    this.eventDashboardLink = `${this.domain}/event/${option.eventId}`;

    this.subjectPart();
    this.htmlPart();
    this.textPart();

    return this.build();
  }

  subjectPart() {
    this.subject = this.i18n.translate(
      'email.spaceEventPermissionRequestApproved.subject',
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
      'email.spaceEventPermissionRequestApproved.html',
      {
        lang: this.language,
        args: {
          name: this.name,
          eventTitle: this.eventTitle,
          permissionResponseSummary,
          resolveLink: this.resolveLink,
          externalBookingLink: this.externalBookingLink,
          eventDashboardLink: this.eventDashboardLink,
        },
      },
    );

    this.html = this.decorateHtmlPart(html);

    return this.html;
  }

  textPart() {
    const permissionResponseSummary = this.i18n.translate(
      'summary.permissionResponseSummary.text',
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
      'email.spaceEventPermissionRequestApproved.text',
      {
        lang: this.language,
        args: {
          name: this.name,
          eventTitle: this.eventTitle,
          permissionResponseSummary,
          resolveLink: this.resolveLink,
          externalBookingLink: this.externalBookingLink,
          eventDashboardLink: this.eventDashboardLink,
        },
      },
    );

    return this.text;
  }
}
