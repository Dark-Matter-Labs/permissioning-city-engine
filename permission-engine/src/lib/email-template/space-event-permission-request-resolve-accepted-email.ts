import { Language } from '../type';
import { Email } from './email';
import { I18nService } from 'nestjs-i18n';

export class SpaceEventPermissionRequestResolveAcceptedEmail extends Email {
  language: Language;
  subject: string;
  html: string;
  text: string;

  target: 'eventOrganizer' | 'spacePermissioner';

  name: string;
  eventId: string;
  eventTitle: string;
  eventTopics: string[];
  eventDetails: string;
  eventStartsAt: string;
  eventEndsAt: string;
  spaceEventSummary: string;
  eventDashboardLink: string;

  constructor(
    private readonly i18n: I18nService,
    option: {
      language: Language;
      name: string;
      eventId: string;
      eventTitle: string;
      eventTopics: string[];
      eventDetails: string;
      eventStartsAt: string;
      eventEndsAt: string;
    },
  ) {
    super(option);

    this.name = option.name;
    this.eventTitle = option.eventTitle;

    this.eventId = option.eventId;
    this.eventTitle = option.eventTitle;
    this.eventTopics = option.eventTopics;
    this.eventDetails = option.eventDetails;
    this.eventStartsAt = option.eventStartsAt;
    this.eventEndsAt = option.eventEndsAt;
    // TODO. Check routing policy in FrontEnd
    this.eventDashboardLink = `${this.domain}/event/${this.eventId}`;

    this.subjectPart();
    this.htmlPart();
    this.textPart();

    return this.build();
  }

  subjectPart() {
    this.subject = this.i18n.translate(
      `email.spaceEventPermissionRequestResolveAccepted.${this.target}.subject`,
      {
        lang: this.language,
        args: {},
      },
    );

    return this.subject;
  }

  htmlPart() {
    const spaceEventSummary = this.i18n.translate(
      'summary.spaceEventSummary.html',
      {
        lang: this.language,
        args: {
          eventTitle: this.eventTitle,
          eventTopics: this.eventTopics.map((item) => item).join(', '),
          eventDetails: this.eventDetails,
          eventStartsAt: this.eventStartsAt,
          eventEndsAt: this.eventEndsAt,
        },
      },
    );
    const html = this.i18n.translate(
      `email.spaceEventPermissionRequestResolveAccepted.${this.target}.html`,
      {
        lang: this.language,
        args: {
          name: this.name,
          eventTitle: this.eventTitle,
          spaceEventSummary,
          eventDashboardLink: this.eventDashboardLink,
        },
      },
    );

    this.html = this.decorateHtmlPart(html);

    return this.html;
  }

  textPart() {
    const spaceEventSummary = this.i18n.translate(
      'summary.spaceEventSummary.text',
      {
        lang: this.language,
        args: {
          eventTitle: this.eventTitle,
          eventTopics: this.eventTopics.map((item) => item).join(', '),
          eventDetails: this.eventDetails,
          eventStartsAt: this.eventStartsAt,
          eventEndsAt: this.eventEndsAt,
        },
      },
    );
    this.text = this.i18n.translate(
      `email.spaceEventPermissionRequestResolveAccepted.${this.target}.text`,
      {
        lang: this.language,
        args: {
          name: this.name,
          eventTitle: this.eventTitle,
          spaceEventSummary,
          eventDashboardLink: this.eventDashboardLink,
        },
      },
    );

    return this.text;
  }
}
