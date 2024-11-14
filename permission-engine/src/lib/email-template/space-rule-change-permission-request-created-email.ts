import { Language } from '../type';
import { Email } from './email';
import { I18nService } from 'nestjs-i18n';

export class SpaceRuleChangePermissionRequestCreatedEmail extends Email {
  language: Language;
  subject: string;
  html: string;
  text: string;

  name: string;
  spaceId: string;
  spaceName: string;
  timeoutAt: string;
  communityDashboardLink: string;

  constructor(
    private readonly i18n: I18nService,
    option: {
      language: Language;
      name: string;
      spaceId: string;
      spaceName: string;
      timeoutAt: string;
    },
  ) {
    super(option);

    this.name = option.name;
    this.spaceId = option.spaceId;
    this.spaceName = option.spaceName;
    this.timeoutAt = option.timeoutAt;
    // TODO. Check routing policy in FrontEnd
    this.communityDashboardLink = `${this.domain}/space/${this.spaceId}/community`;

    this.subjectPart();
    this.htmlPart();
    this.textPart();

    return this.build();
  }

  subjectPart() {
    this.subject = this.i18n.translate(
      'email.spaceRuleChangePermissionRequestCreated.subject',
      {
        lang: this.language,
        args: {},
      },
    );

    return this.subject;
  }

  htmlPart() {
    const html = this.i18n.translate(
      'email.spaceRuleChangePermissionRequestCreated.html',
      {
        lang: this.language,
        args: {
          name: this.name,
          spaceName: this.spaceName,
          timeoutAt: this.timeoutAt,
          communityDashboardLink: this.communityDashboardLink,
        },
      },
    );

    this.html = this.decorateHtmlPart(html);

    return this.html;
  }

  textPart() {
    this.text = this.i18n.translate(
      'email.spaceRuleChangePermissionRequestCreated.text',
      {
        lang: this.language,
        args: {
          name: this.name,
          spaceName: this.spaceName,
          timeoutAt: this.timeoutAt,
          communityDashboardLink: this.communityDashboardLink,
        },
      },
    );

    return this.text;
  }
}
