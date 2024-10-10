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

export enum RuleTarget {
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

export enum RuleBlockType {
  // space
  spaceGeneral = 'space:general',
  spaceConsentMethod = 'space:consent_method',
  spacePostEventCheck = 'space:post_event_check',
  // spaceEvent
  spaceEventGeneral = 'space_event:general',
  spaceEventAccess = 'space_event:access',
}

export enum PermissionRequestStatus {
  // created
  pending = 'pending',
  // assign permissioners
  assigned = 'assigned',
  assignFailed = 'assign_failed',
  // permissioner action results
  issueRaised = 'issue_raised',
  reviewApproved = 'review_approved',
  reviewApprovedWithCondition = 'review_approved_with_condition',
  // resolved by event organizer
  resolveRejected = 'resolve_rejected',
  resolveAccepted = 'resolve_accepted',
  resolveDropped = 'resolve_dropped',
  resolveCancelled = 'resolve_cancelled',
}

export enum UserType {
  individual = 'individual',
  organization = 'organization',
  government = 'government',
}

export enum UserNotificationTarget {
  spaceOwner = 'space_owner',
  eventOrgnaizer = 'event_orgnaizer',
  eventAttendee = 'event_attendee',
  permissioner = 'permissioner',
  topicFollower = 'topic_follower',
  spaceFollower = 'space_follower',
  ruleAuthor = 'rule_author',
}

export enum UserNotificationType {
  internal = 'internal',
  external = 'external',
}

export enum UserNotificationStatus {
  pending = 'pending',
  complete = 'complete',
  failed = 'failed',
}

export enum RuleType {
  space = 'space',
  spaceEvent = 'space_event',
}
