import { Language } from '../type';
import { Email } from './email';
import { I18nService } from 'nestjs-i18n';

export class SpaceRuleChangePermissionRequestedEmail extends Email {
  language: Language;
  subject: string;
  html: string;
  text: string;

  name: string;
  spaceId: string;
  communityDashboardLink: string;

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
    // TODO. Check routing policy in FrontEnd
    this.communityDashboardLink = `${this.domain}/space/${this.spaceId}/community`;

    this.subjectPart();
    this.htmlPart();
    this.textPart();

    return this.build();
  }

  subjectPart() {
    this.subject = this.i18n.translate(
      'email.spaceRuleChangePermissionRequested.subject',
      {
        lang: this.language,
        args: {},
      },
    );

    return this.subject;
  }

  htmlPart() {
    const html = this.i18n.translate(
      'email.spaceRuleChangePermissionRequested.html',
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
      'email.spaceRuleChangePermissionRequested.text',
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
