import { Language } from '../type';
import { Email } from './email';
import { I18nService } from 'nestjs-i18n';

export class SpaceEventPermissionRequestReviewCompletedEmail extends Email {
  language: Language;
  subject: string;
  html: string;
  text: string;

  name: string;
  spaceId: string;
  permissionRequestId: string;
  eventTitle: string;
  excitements: string[];
  worries: string[];
  conditions: string[];
  communityDashboardLink: string;

  constructor(
    private readonly i18n: I18nService,
    option: {
      language: Language;
      name: string;
      spaceId: string;
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
    this.communityDashboardLink = `${this.domain}/space/${this.spaceId}/community/permission/request?id=${this.permissionRequestId}`;

    this.subjectPart();
    this.htmlPart();
    this.textPart();

    return this.build();
  }

  subjectPart() {
    this.subject = this.i18n.translate(
      'email.spaceEventPermissionRequestReviewCompleted.subject',
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
      'email.spaceEventPermissionRequestReviewCompleted.html',
      {
        lang: this.language,
        args: {
          name: this.name,
          eventTitle: this.eventTitle,
          permissionResponseSummary,
          communityDashboardLink: this.communityDashboardLink,
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
      'email.spaceEventPermissionRequestReviewCompleted.text',
      {
        lang: this.language,
        args: {
          name: this.name,
          eventTitle: this.eventTitle,
          permissionResponseSummary,
          communityDashboardLink: this.communityDashboardLink,
        },
      },
    );

    return this.text;
  }
}
