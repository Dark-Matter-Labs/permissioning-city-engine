import { EmailTemplate } from '../email-template/email-template.interface';

export type ValidationJobData = {
  pdfFile: Buffer;
  userId: string;
  targetId: string;
};

export type NotificationSendJobData = {
  id: string;
  to: string;
  email: EmailTemplate;
};

export enum RuleTarget {
  space = 'space',
  spaceEvent = 'space_event',
}

export enum SpaceEventStatus {
  pending = 'pending',
  permissionRequested = 'permission_requested',
  permissionGranted = 'permission_granted',
  running = 'running', // set by event organizer or daemon after starts_at
  closed = 'closed', // closed by daemon after ends_at
  complete = 'complete', // completed by the event organizer
}

export enum RuleBlockType {
  // space
  spaceGeneral = 'space:general',
  spaceConsentMethod = 'space:consent_method',
  spacePostEventCheck = 'space:post_event_check',
  // spaceEvent
  spaceEventGeneral = 'space_event:general',
  spaceEventAccess = 'space_event:access', // content: {public|invited}:{free|paid}
  spaceEventRequireEquipment = 'space_event:require_equipment', // content: {equipment}:{quantity}
  spaceEventExpectedAttendeeCount = 'space_event:expected_attendee_count', // number
  spaceEventException = 'space_event:exception', // content: {spaceRuleBlockId}:{reason}
  spaceEventBenefit = 'space_event:benefit',
  spaceEventRisk = 'space_event:risk',
  spaceEventSelfRiskAssesment = 'space_event:self_risk_assesment',
  spaceEventInsurance = 'space_event:insurance', // content: file download path: s3
}

export enum SpaceEquipmentType {
  general = 'general',
  audio = 'audio',
  video = 'video',
  lighting = 'lighting',
  stationery = 'stationery',
  furniture = 'furniture',
  sports = 'sports',
  kitchen = 'kitchen',
  craft = 'craft',
  safty = 'safty',
  computer = 'computer',
  facility = 'facility',
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
  general = 'general',
}

export enum UserNotificationType {
  internal = 'internal',
  external = 'external',
}

export enum UserNotificationStatus {
  // notice created
  pending = 'pending',
  // notice queued
  queued = 'queued',
  // notice sent via email
  noticed = 'noticed',
  // user marked as complete
  complete = 'complete',
  // send notice failed
  noticeFailed = 'notice_failed',
}

export enum UserNotificationTemplateName {
  welcome = 'welcome',
  permissionRequested = 'permission-requested',
  permissionGranted = 'permission-granted',
  spaceCreated = 'space-created',
}

export enum RuleType {
  space = 'space',
  spaceEvent = 'space_event',
}

export enum PermissionResponseStatus {
  pending = 'pending',
  approved = 'approved',
  approvedWithCondition = 'approved_with_condition',
  rejected = 'rejected',
}

