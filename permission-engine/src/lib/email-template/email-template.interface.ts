import { Language } from '../type';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
  subjectPart(language: Language): string;
  htmlPart(language: Language): string;
  textPart(language: Language): string;
}
