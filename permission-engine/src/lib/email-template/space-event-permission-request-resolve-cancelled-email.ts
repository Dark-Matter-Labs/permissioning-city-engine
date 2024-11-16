import { Language } from '../type';
import { Email } from './email';
import { I18nService } from 'nestjs-i18n';

export class SpaceEventPermissionRequestResolveCancelledEmail extends Email {
  language: Language;
  subject: string;
  html: string;
  text: string;

  target: 'eventOrganizer' | 'spacePermissioner';

  name: string;
  spaceId: string;
  eventTitle: string;
  resolveDetails: string;
  spaceDashboardLink: string;
  communityDashboardLink: string;

  constructor(
    private readonly i18n: I18nService,
    option: {
      language: Language;
      name: string;
      spaceId: string;
      eventTitle: string;
      resolveDetails: string;
    },
  ) {
    super(option);

    this.name = option.name;
    this.eventTitle = option.eventTitle;
    this.spaceId = option.spaceId;
    this.resolveDetails = option.resolveDetails;
    // TODO. Check routing policy in FrontEnd
    this.spaceDashboardLink = `${this.domain}/space/${this.spaceId}`;
    this.communityDashboardLink = `${this.domain}/space/${this.spaceId}/community`;

    this.subjectPart();
    this.htmlPart();
    this.textPart();

    return this.build();
  }

  subjectPart() {
    this.subject = this.i18n.translate(
      `email.spaceEventPermissionRequestResolveCancelled.${this.target}.subject`,
      {
        lang: this.language,
        args: {},
      },
    );

    return this.subject;
  }

  htmlPart() {
    const html = this.i18n.translate(
      `email.spaceEventPermissionRequestResolveCancelled.${this.target}.html`,
      {
        lang: this.language,
        args: {
          name: this.name,
          eventTitle: this.eventTitle,
          resolveDetails: this.resolveDetails,
          spaceDashboardLink: this.spaceDashboardLink,
          communityDashboardLink: this.communityDashboardLink,
        },
      },
    );

    this.html = this.decorateHtmlPart(html);

    return this.html;
  }

  textPart() {
    this.text = this.i18n.translate(
      `email.spaceEventPermissionRequestResolveCancelled.${this.target}.text`,
      {
        lang: this.language,
        args: {
          name: this.name,
          eventTitle: this.eventTitle,
          resolveDetails: this.resolveDetails,
          spaceDashboardLink: this.spaceDashboardLink,
          communityDashboardLink: this.communityDashboardLink,
        },
      },
    );

    return this.text;
  }
}
