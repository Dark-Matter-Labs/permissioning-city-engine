import { Language } from '../type';

export interface EmailTemplate {
  language: Language;
  subject: string;
  html: string;
  text: string;
  subjectPart(): string;
  htmlPart(): string;
  textPart(): string;
}
