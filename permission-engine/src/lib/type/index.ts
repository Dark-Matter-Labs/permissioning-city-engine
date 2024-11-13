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
  completeWithIssueResolved = 'complete_with_issue_resolved', // issue raised by the event organizer was resolved
}

export enum SpaceApprovedRuleSortBy {
  popularity = 'popularity',
  timeAsc = 'time-asc',
  timeDesc = 'time-desc',
}

/**
 * <RuleBlock.content divider rules>
 * Array divider: ';'
 * Type divider: '^'
 * Time unit divider: '-'
 */
export enum RuleBlockType {
  /**
   * Space: rule blocks for space rules
   * [Required] required rule block type
   * [Optional] optional rule block type
   * [PrePermissionCheck] need to consent on this rule blocks for auto permission
   * [Private] only visible to space permissioners and approved event organizers & not going to be inherited to child rules
   * [PostEventCheck] check list for event completion
   */
  /**
   * [Optional] General descriptive rule block for space rule
   * content: string
   */
  spaceGeneral = 'space:general',
  /**
   * [Optional] Excluded topics in the space
   * content: {topicId}
   */
  spaceExcludedTopic = 'space:excluded_topic',
  /**
   * [Optional] Public guide: visible to everyone
   * content: string
   */
  spaceGuide = 'space:guide',
  /**
   * [Private] [Optional] Private guide: only visible to space permissioners and approved event organizers
   * content: string
   */
  spacePrivateGuide = 'space:private_guide',
  /**
   * [Required] Consent method for space permissioners
   * content: /^(under|over|is):(100|[1-9]?[0-9]):(yes|no)$/
   */
  spaceConsentMethod = 'space:consent_method',
  /**
   * [Required] Consent timeout for space permissioners
   * content: {number}{d|h}
   */
  spaceConsentTimeout = 'space:consent_timeout',
  /**
   * [PostEventCheck] [Optional] Post event boolean question for event organizers
   * content: string
   */
  spacePostEventCheck = 'space:post_event_check',
  /**
   * [PrePermissionCheck] [Optional] Custom pre permission check rules made by space permissioners to ask boolean question: event organizers need to agree on this for auto permission
   * content: string
   */
  spacePrePermissionCheck = 'space:pre_permission_check',
  /**
   * [PrePermissionCheck] [Required] Allowed event access types
   * content: array of {SpaceEventAccessType};{SpaceEventAccessType}; ...
   */
  spaceAllowedEventAccessType = 'space:allowed_event_access_type',
  /**
   * [PrePermissionCheck] [Required] Max Attendee limit
   * content: number
   */
  spaceMaxAttendee = 'space:max_attendee',
  /**
   * [PrePermissionCheck] [Required] Max noise level
   * content: {NoiseLevel}
   */
  spaceMaxNoiseLevel = 'space:max_noise_level',
  /**
   * [PrePermissionCheck] [Required] Availability description
   * content: {mon|tue|wed|thu|fri|sat|sun}-{00:00}-{24:00};{mon|tue|wed|thu|fri|sat|sun}-{00:00}-{24:00}; ...
   */
  spaceAvailability = 'space:availability',
  /**
   * [PrePermissionCheck] [Required] Availability buffer between events
   * content: {number}{d|h|m}
   */
  spaceAvailabilityBuffer = 'space:availability_buffer',
  /**
   * [PrePermissionCheck] [Required] Availability unit
   * content: {number}{d|h|m}
   */
  spaceAvailabilityUnit = 'space:availability_unit',
  // TODO. implement max availability unit count
  /**
   * [PrePermissionCheck] [Required] Max allowed availability unit count
   * content: integer between 1 and 60
   */
  spaceMaxAvailabilityUnitCount = 'space:max_availability_unit_count',
  /**
   * [PrePermissionCheck] [Required] Cancellation deadline for events
   * content: {number}{d|h|m}
   */
  spaceCancelDeadline = 'space:cancel_deadline',

  /**
   * SpaceEvent: rule blocks for event rules
   * [Required] required rule block type
   * [Optional] optional rule block type
   * [Private] only visible to space permissioners and approved event organizers & not going to be inherited to child rules
   */
  /**
   * [Optional] General descriptive rule block for event rule
   * content: string
   */
  spaceEventGeneral = 'space_event:general',
  /**
   * [Optional] Expected benefit
   * content: string
   */
  spaceEventBenefit = 'space_event:benefit',
  /**
   * [Optional] Expected risk
   * content: string
   */
  spaceEventRisk = 'space_event:risk',
  /**
   * [Optional] Description on self risk assesment
   * content: string
   */
  spaceEventSelfRiskAssesment = 'space_event:self_risk_assesment',
  /**
   * [Optional] Exception against a space rule block
   * content: {spaceRuleBlockHash}^{desiredValue}^{reason}
   * [Policy] No exception === agree
   */
  spaceEventException = 'space_event:exception',
  /**
   * [Optional] [Private] space equipment requirement for event
   * content: {spaceEquipmentId}^{quantity}
   */
  spaceEventRequireEquipment = 'space_event:require_equipment',
  /**
   * [Optional] [Private] Insurance file for event
   * content: file download path: s3
   */
  spaceEventInsurance = 'space_event:insurance',
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
  //Facilitiy
  facility = 'facility',
  //Non Facilitiy
  general = 'general',
  audio = 'audio',
  video = 'video',
  lighting = 'lighting',
  stationery = 'stationery',
  furniture = 'furniture',
  sports = 'sports',
  kitchen = 'kitchen',
  craft = 'craft',
  safety = 'safety',
  computer = 'computer',
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
   * <Permission for a space rule change request created>
   * Inform the permission requester when rule change permission request is created for the space
   */
  spaceRuleChangePermissionRequestCreated = 'space-rule-change-permission-request-created',
  /**
   * <Permission for a space rule change requested>
   * Inform the space permissioners when rule change permission request is created for the space
   * Provide a link to space permissioner dashboard that would show the form UI for making permission response
   */
  spaceRuleChangePermissionRequested = 'space-rule-change-permission-requested',
  /**
   * <Permission for a space rule change request Created>
   * Inform the permission requester when rule change permission request is created for the space
   */
  spaceEventRulePreApprovePermissionRequestCreated = 'space-event-rule-pre-approve-permission-request-created',
  /**
   * <Permission for a space rule change requested>
   * Inform the space permissioners when rule change permission request is created for the space
   * Provide a link to space permissioner dashboard that would show the form UI for making permission response
   */
  spaceEventRulePreApprovePermissionRequested = 'space-event-rule-pre-approve-permission-requested',
  /**
   * <Review for space event permission request is complete and approved>
   * Inform the permission requester(event organizer) when permission request review result is made and approved
   * Show permission response result summary
   * Tell the event organizer what to do
   * Provide a link to event dashboard for the event organizer to resolve the permission request
   */
  spaceEventPermissionRequestApproved = 'space-event-permission-request-approved',
  /**
   * <Review for space event permission request is complete and rejected>
   * Inform the permission requester(event organizer) when permission request review result is made and rejected
   * Show permission response result summary
   * Tell the event organizer what to do
   * Provide a link to event dashboard for the event organizer to resolve the permission request
   */
  spaceEventPermissionRequestRejected = 'space-event-permission-request-rejected',
  /**
   * <Review for space event permission request is complete>
   * Inform the space permissioners when permission request review result is made
   * Show permission response result summary
   */
  spaceEventPermissionRequestReviewCompleted = 'space-event-permission-request-review-completed',
  /**
   * <Review for space rule change permission request is complete and approved>
   * Inform the permission requester(rule change proposer) when permission request review result is made and approved
   * Show permission response result summary
   * Tell the rule change proposer what to do
   */
  spaceRuleChangePermissionRequestApproved = 'space-rule-change-permission-request-approved',
  /**
   * <Review for space rule change permission request is complete and rejected>
   * Inform the permission requester(rule change proposer) when permission request review result is made and rejected
   * Show permission response result summary
   * Tell the rule change proposer what to do
   */
  spaceRuleChangePermissionRequestRejected = 'space-rule-change-permission-request-rejected',
  /**
   * <Review for space rule change permission request is complete>
   * Inform the space permissioners when permission request review result is made
   * Show permission response result summary
   */
  spaceRuleChangePermissionRequestReviewCompleted = 'space-rule-change-permission-request-review-completed',
  /**
   * <Review for space event rule pre approval permission request is complete and approved>
   * Inform the permission requester(space event rule pre approval proposer) when permission request review result is made and approved
   * Show permission response result summary
   * Tell the space event rule pre approval proposer what to do
   */
  spaceEventPreApprovePermissionRequestApproved = 'space-event-pre-approve-permission-request-approved',
  /**
   * <Review for space event rule pre approval permission request is complete and rejected>
   * Inform the permission requester(space event rule pre approval proposer) when permission request review result is made and rejected
   * Show permission response result summary
   * Tell the space event rule pre approval proposer what to do
   */
  spaceEventPreApprovePermissionRequestRejected = 'space-event-pre-approve-permission-request-rejected',
  /**
   * <Review for space event rule pre approval permission request is complete>
   * Inform the space permissioners when permission request review result is made
   * Show permission response result summary
   */
  spaceEventPreApprovePermissionRequestReviewCompleted = 'space-event-pre-approve-permission-request-review-completed',
  /**
   * <Permission request for space event is resolved to accepted>
   * Inform the permission requester(event organizer) and space permissioners when permission request is resolved by the event organizer to be accepted
   * Show resolve result summary
   * Provide the permission code for the event organizer <-> no permissio ncode for rule change proposer
   * Provide a link to external booking service that the event organizer can paste the permission code and proceed with booking
   */
  spaceEventPermissionRequestResolveAccepted = 'space-event-permission-request-resolve-accepted',
  /**
   * <Permission request for space event is resolved to dropped>
   * Inform the permission requester(event organizer) and space permissioners when permission request is resolved by the event organizer to be dropped
   * Show resolve result summary
   * Provide the permission code for the event organizer <-> no permissio ncode for rule change proposer
   * Provide a link to external booking service that the event organizer can paste the permission code and proceed with booking
   */
  spaceEventPermissionRequestResolveDropped = 'space-event-permission-request-resolve-dropped',
  /**
   * <Permission request for space event is resolved to cancelled>
   * Inform the permission requester(event organizer) and space permissioners when permission request is resolved by the event organizer to be cancelled
   * Show resolve result summary
   * Provide the permission code for the event organizer <-> no permissio ncode for rule change proposer
   * Provide a link to external booking service that the event organizer can paste the permission code and proceed with booking
   */
  spaceEventPermissionRequestResolveCancelled = 'space-event-permission-request-resolve-cancelled',
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
  abstention = 'abstention',
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
