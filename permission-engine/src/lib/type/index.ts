import { EmailTemplate } from '../email-template/email-template.interface';

export type NotificationHandlerJobData = {
  userNotificationId: string;
  to: string;
  email: EmailTemplate;
};

export type PermissionHandlerJobData = {
  permissionProcessType: PermissionProcessType;
  permissionRequestId?: string;
  permissionResponseId?: string;
};

export enum RuleTarget {
  space = 'space',
  spaceEvent = 'space_event',
}

export enum SpaceEventStatus {
  pending = 'pending',
  permissionRequested = 'permission_requested',
  permissionRejected = 'permission_rejected',
  permissionGranted = 'permission_granted',
  cancelled = 'cancelled',
  running = 'running', // set by event organizer or daemon after starts_at
  closed = 'closed', // closed by daemon after ends_at
  complete = 'complete', // completed by the event organizer
  completeWithIssue = 'complete_with_issue', // completed by the event organizer with issue
}

export enum SpaceApprovedRuleSortBy {
  popularity = 'popularity',
  timeAsc = 'timeAsc',
  timeDesc = 'timeDesc',
}

/**
 * <RuleBlock.content divider rules>
 * Array divider: ';'
 * Type divider: '^'
 * Time unit divider: '-'
 */
export enum RuleBlockType {
  // space
  spaceGeneral = 'space:general',
  spaceConsentMethod = 'space:consent_method',
  spaceConsentTimeout = 'space:consent_timeout', // content: {number}{d|h}
  spaceAccess = 'space:access', // content: array of {SpaceEventAccessType};{SpaceEventAccessType}; ...
  spaceMaxAttendee = 'space:max_attendee', // content: number
  spaceMaxNoiseLevel = 'space:max_noise_level', // content: {NoiseLevel}
  spaceAvailability = 'space:availability', // content: {mon|tue|wed|thu|fri|sat|sun}-{00:00}-{24:00};{mon|tue|wed|thu|fri|sat|sun}-{00:00}-{24:00}; ...
  spaceAvailabilityUnit = 'space:availability_unit', // content: {number}{d|h|m}
  spaceAvailabilityBuffer = 'space:availability_buffer', // content: {number}{d|h|m}
  spacePrePermissionCheck = 'space:pre_permission_check', // content: {boolean question}^{default answer in boolean} -> ask boolean questions for event organizers before permission request
  spacePostEventCheck = 'space:post_event_check', // content: boolean question for post event check
  // spaceEvent
  // optional
  spaceEventGeneral = 'space_event:general',
  spaceEventRequireEquipment = 'space_event:require_equipment', // content: {spaceEquipmentId}^{quantity}
  spaceEventException = 'space_event:exception', // content: {spaceRuleBlockHash}^{desiredValue}^{reason}
  spaceEventBenefit = 'space_event:benefit', // content: expected benefit
  spaceEventRisk = 'space_event:risk', // content: expected risk
  spaceEventSelfRiskAssesment = 'space_event:self_risk_assesment', // content: description on self risk assesment
  spaceEventInsurance = 'space_event:insurance', // content: file download path: s3
  // required
  spaceEventAccess = 'space_event:access', // content: {SpaceEventAccessType}
  spaceEventExpectedAttendeeCount = 'space_event:expected_attendee_count', // number
  spaceEventNoiseLevel = 'space_event:noise_level', // {NoiseLevel}
  spaceEventPrePermissionCheckAnswer = 'space_event:pre_permission_check_answer', // {spaceRuleBlockHash}^{answer in boolean}
}

export enum RuleBlockContentDivider {
  array = ';',
  type = '^',
  time = '-',
  operator = ':',
}

export enum NoiseLevel {
  high = 'high',
  medium = 'medium',
  low = 'low',
}

export enum SpaceEventAccessType {
  publicFree = `public${RuleBlockContentDivider.operator}free`,
  publicPaid = `public${RuleBlockContentDivider.operator}paid`,
  privateFree = `private${RuleBlockContentDivider.operator}free`,
  privatePaid = `private${RuleBlockContentDivider.operator}paid`,
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

export type SpaceAvailability = {
  startTime: Date;
  endTime: Date;
};

export enum PermissionRequestStatus {
  // created
  pending = 'pending',
  // assign permissioners
  assigned = 'assigned',
  assignFailed = 'assign_failed',
  // permissioner action results
  reviewApproved = 'review_approved',
  reviewApprovedWithCondition = 'review_approved_with_condition',
  reviewRejected = 'review_rejected',
}

export enum PermissionRequestResolveStatus {
  resolveRejected = 'resolve_rejected',
  // resolved by event organizer
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
  noticeSent = 'notice_sent',
  // notice delivered via email
  noticeComplete = 'notice_complete',
  // user marked as complete
  complete = 'complete',
  // send notice failed
  noticeFailed = 'notice_failed',
}

export enum UserNotificationTemplateName {
  /**
   * <Welcome>
   * Greet a new user
   * Tell them who we are and what the Permissioning Engine is
   * Lead them to how-to guides
   */
  welcome = 'welcome',
  /**
   * <Permission request for event created>
   * Inform the event organizer when permission request is created for the event
   * Provide a link to event dashboard
   */
  spaceEventPermissionRequestCreated = 'space-event-permission-request-created',
  /**
   * <Permission for an event requested>
   * Inform the space permissioners when event permission request is created for the space
   * Provide a link to space permissioner dashboard that would show the form UI for making permission response
   */
  spaceEventPermissionRequested = 'space-event-permission-requested',
  /**
   * <Permission for a space rule change requested>
   * Inform the space permissioners when rule change permission request is created for the space
   * Provide a link to space permissioner dashboard that would show the form UI for making permission response
   */
  spaceRuleChangePermissionRequested = 'space-rule-change-permission-requested',
  /**
   * <Permission for a space rule change requested>
   * Inform the space permissioners when rule change permission request is created for the space
   * Provide a link to space permissioner dashboard that would show the form UI for making permission response
   */
  spaceEventRulePreApprovePermissionRequested = 'space-event-rule-pre-approve-permission-requested',
  /**
   * <Permission request review is complete>
   * Inform the permission requester(event organizer) and space permissioners when permission request review result is made
   * Show permission response result summary
   * Tell the event organizer what to do
   * Provide a link to event dashboard for the event organizer to resolve the permission request
   */
  permissionRequestReviewed = 'permission-request-reviewed',
  /**
   * <Permission request is resolved>
   * Inform the permission requester(rule change proposer or event organizer) and space permissioners when permission request is resolved by the event organizer
   * Show resolve result summary
   * Provide the permission code for the event organizer <-> no permissio ncode for rule change proposer
   * Provide a link to external booking service that the event organizer can paste the permission code and proceed with booking
   */
  permissionRequestResolved = 'permission-request-resolved',
  /**
   * <Space is created>
   * Inform the space owner when space is created
   * Tell them what to do next: invite space permissioners
   * Provide a link to space dashboard that the space owner can invite other space permissioners
   */
  spaceCreated = 'space-created',
  /**
   * <Space is updated>
   * Inform the space permissioners when space data is updated
   * Show resolve result summary
   * Provide a link to external booking service that the event organizer can paste the permission code and proceed with booking
   */
  spaceUpdated = 'space-updated',
  /**
   * <Event is created>
   * Inform the event organizer when event is created
   * Tell them what to do next: request for permission
   * Provide a link to event dashboard to proceed
   */
  spaceEventCreated = 'space-event-created',
  /**
   * <Event is started>
   * Inform the event organizer and space permissioners when the event is started
   * Tell them what to do next: event complete process
   * Provide a link to space/event dashboard to proceed
   */
  spaceEventStarted = 'space-event-started',
  /**
   * <Event is closed>
   * Inform the event organizer when the event is closed
   *  Tell them what to do next: event complete process
   * Provide a link to space/event dashboard
   */
  spaceEventClosed = 'space-event-closed',
  /**
   * <Event is completed>
   * Inform the event organizer and space permissioners when the event is completed
   * Show event completion result
   * Provide a link to space/event dashboard
   */
  spaceEventCompleted = 'space-event-completed',
  /**
   * <Event is completed>
   * Inform the event organizer and space permissioners when the event is completed with issue
   * Show event completion result
   * Tell them what to do next: resolve the issue
   * Provide a link to space/event dashboard to proceed
   */
  spaceEventCompletedWithIssue = 'space-event-completed-with-issue',
  /**
   * <Event issue is resolved>
   * Inform the event organizer and space permissioners when the issue raised by the event is resolved
   * Show issue resolve result
   * Provide a link to space/event dashboard to proceed
   */
  spaceEventIssueResolved = 'space-event-issue-resolved',
  /**
   * <Space issue is raised>
   * Inform the space permissioners when the issue raised on the space
   * Tell them what to do next: resolve the issue
   * Show issue details
   * Provide a link to space dashboard to proceed
   */
  spaceIssueRaised = 'space-issue-raised',
  /**
   * <Space issue is resolved>
   * Inform the space permissioners when the issue raised on the space is resolved
   * Show resolve details
   * Provide a link to space dashboard
   */
  spaceIssueResolved = 'space-issue-resolved',
  /**
   * <Rule is created>
   * Inform the rule author when the rule is created
   * Show rule details
   * Provide a link to rule dashboard
   */
  ruleCreated = 'rule-created',
  /**
   * <Rule is created>
   * Inform the rule author when the rule is assigned to space or event
   * Show space/event details
   * Provide a link to rule dashboard
   */
  ruleAssigned = 'rule-assigned',
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
  timeout = 'timeout',
}

export type IpLocationInfo = {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
};

export enum Language {
  en = 'en',
  ko = 'ko',
}

export enum PermissionRequestTarget {
  spaceEvent = 'space-event',
  spaceRule = 'space-rule',
  spaceEventRulePreApprove = 'space-event-rule-pre-approve',
}

export enum PermissionProcessType {
  spaceEventPermissionRequestCreated = 'space-event-permission-request-created',
  spaceRuleChangePermissionRequestCreated = 'space-rule-change-permission-request-created',
  spaceEventRulePreApprovePermissionRequestCreated = 'space-event-rule-pre-approve-permission-request-created',
  permissionResponseReviewed = 'permission-response-reviewed',
  permissionResponseReviewCompleted = 'permission-response-review-completed',
  permissionRequestResolved = 'permission-request-resolved',
}

export type SesMail = {
  timestamp: string;
  messageId: string;
  source: string;
  sourceArn: string;
  sourceIp: string;
  sendingAccountId: string;
  callerIdentity: string;
  destination: string[];
  headersTruncated: boolean;
  headers: SesMailHeader[];
  commonHeaders: SesMailCommonHeaders;
};

export type SesMailHeader = {
  name: string;
  value: string;
};

export type SesMailCommonHeaders = {
  from: string[];
  date: string;
  to: string[];
  messageId: string;
  subject: string;
};

export type SesBounce = {
  bounceType: SesBounceType;
  bounceSubType: SesBounceSubType;
  bounceRecipients: SesBounceRecipient[];
  timestamp: string;
  feedbackId: string;
  remoteMtaIp?: string;
  reportingMTA?: string;
};

export enum SesBounceType {
  Undetermined = 'Undetermined',
  Permanent = 'Permanent',
  Transient = 'Transient',
}

export enum SesBounceSubType {
  // Undetermined
  Undetermined = 'Undetermined',
  // Permanent & Transient
  General = 'General',
  // Permanent
  NoEmail = 'NoEmail',
  Supressed = 'Supressed',
  OnAccountSuppressionList = 'OnAccountSuppressionList',
  // Transient
  MailboxFull = 'MailboxFull',
  MessageTooLarge = 'MessageTooLarge',
  ContentRejected = 'ContentRejected',
  AttachmentRejected = 'AttachmentRejected',
}

export type SesBounceRecipient = {
  status?: string;
  action?: string;
  diagnosticCode?: string;
  emailAddress: string;
};

export type SesComplaint = {
  complainedRecipients: SesComplainedRecipients[];
  timestamp: string;
  feedbackId: string;
  complaintSubType: string;
  userAgent?: string;
  complaintFeedbackType?: SesComplaintFeedbackType;
  arrivalDate?: string;
};

export type SesComplainedRecipients = {
  emailAddress: string;
};

export enum SesComplaintFeedbackType {
  abuse = 'abuse',
  authFailure = 'auth-failure',
  fraud = 'fraud',
  notSpam = 'not-spam',
  other = 'other',
  virus = 'virus',
}

export type SesDelivery = {
  timestamp: string;
  processingTimeMillis: number;
  recipients: string[];
  smtpResponse: string;
  reportingMTA: string;
  remoteMtaIp: string;
};
