export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
  subjectPart(): string;
  htmlPart(): string;
  textPart(): string;
}
