import { Language } from '../type';
import { EmailTemplate } from './email-template.interface';

export class WelcomeEmail implements EmailTemplate {
  name: string;
  subject: string;
  html: string;
  text: string;

  constructor(option: { name: string }) {
    this.name = option.name;
    this.subjectPart();
    this.htmlPart();
    this.textPart();

    return this;
  }

  subjectPart(language: Language = Language.en) {
    switch (language) {
      case Language.en:
        this.subject = `[Permissioning The City] Welcome, ${this.name}`;
        break;
      case Language.ko:
        this.subject = `[Permissioning The City] ${this.name}님 환영합니다`;
        break;
      default:
        this.subjectPart(Language.en);
        break;
    }
    return this.subject;
  }

  htmlPart(language: Language = Language.en) {
    switch (language) {
      case Language.en:
        this.html = `
          <html>
            <body>
              <h1>
                Welcome, ${this.name}!
              </h1>
              <p>
                We're excited to have you on board at <strong>Permissioning The City</strong>.
              </p>
              <p>
                You can now start exploring the platform and enjoy all the features we offer.
              </p>
              <p>
                If you have any questions, feel free to <a href='mailto:support@permissioning.city'>contact us</a>.
              </p>
              <br>
              <p>
                Best regards,<br>The Permissioning The City Team
              </p>
            </body>
          </html>
        `;
        break;
      case Language.ko:
        this.html = `
          <html>
            <body>
              <h1>
                ${this.name}님 환영합니다!
              </h1>
              <p>
                We're excited to have you on board at <strong>Permissioning The City</strong>.
              </p>
              <p>
                You can now start exploring the platform and enjoy all the features we offer.
              </p>
              <p>
                If you have any questions, feel free to <a href='mailto:support@permissioning.city'>contact us</a>.
              </p>
              <br>
              <p>
                Best regards,<br>The Permissioning The City Team
              </p>
            </body>
          </html>
        `;
        break;
      default:
        this.htmlPart(Language.en);
        break;
    }
    return this.html;
  }

  textPart(language: Language = Language.en) {
    switch (language) {
      case Language.en:
        this.text = `Welcome, ${this.name}!\n\nWe're excited to have you on board at Permissioning The City. You can now start exploring the platform and enjoy all the features we offer.\n\nIf you have any questions, feel free to contact us at support@permissioning.city.\n\nBest regards,\nThe Permissioning The City Team`;
        break;
      case Language.ko:
        this.text = `${this.name}님 환영합니다!\n\nWe're excited to have you on board at Permissioning The City. You can now start exploring the platform and enjoy all the features we offer.\n\nIf you have any questions, feel free to contact us at support@permissioning.city.\n\nBest regards,\nThe Permissioning The City Team`;
        break;
      default:
        this.textPart(Language.en);
        break;
    }
    return this.text;
  }
}
