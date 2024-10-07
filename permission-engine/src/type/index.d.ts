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

export enum RuleType {
  space = 'space',
  spaceEvent = 'space_event',
}

export enum SpaceEventStatus {
  pending = 'pending',
  permissionRequested = 'permission_requested',
  permissionApproved = 'permission_approved',
  permissionRejected = 'permission_rejected',
  running = 'running',
  closed = 'closed',
  complete = 'complete',
}
