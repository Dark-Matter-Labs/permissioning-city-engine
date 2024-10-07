import crypto from 'crypto';

export const hash = (str: string) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};
