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

  subjectPart() {
    this.subject = `[Permissioning The City] Welcome, ${this.name}`;
    return this.subject;
  }

  htmlPart() {
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
    return this.html;
  }

  textPart() {
    this.text = `Welcome, ${this.name}!\n\nWe're excited to have you on board at Permissioning The City. You can now start exploring the platform and enjoy all the features we offer.\n\nIf you have any questions, feel free to contact us at support@permissioning.city.\n\nBest regards,\nThe Permissioning The City Team`;
    return this.text;
  }
}
