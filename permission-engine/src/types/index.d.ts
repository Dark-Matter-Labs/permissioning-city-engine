export type ValidationJobData = {
  pdfFile: Buffer;
  userId: string;
  targetId: string;
};

export type EmailSendJobData = {
  pdfFile: Buffer;
  userId: string;
  targetId: string;
};
