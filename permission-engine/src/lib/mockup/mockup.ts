import { CreatePermissionRequestDto } from 'src/api/permission-request/dto';
import { CreatePermissionResponseDto } from 'src/api/permission-response/dto';
import { CreateRuleBlockDto } from 'src/api/rule-block/dto';
import { CreateRuleDto } from 'src/api/rule/dto';
import { CreateSpaceEquipmentDto } from 'src/api/space-equipment/dto';
import { CreateSpaceEventImageDto } from 'src/api/space-event-image/dto';
import { CreateSpaceEventDto } from 'src/api/space-event/dto';
import { CreateSpaceImageDto } from 'src/api/space-image/dto';
import { CreateSpacePermissionerDto } from 'src/api/space-permissioner/dto';
import { CreateSpaceDto } from 'src/api/space/dto';
import { CreateUserNotificationDto } from 'src/api/user-notification/dto';
import { CreateUserDto } from 'src/api/user/dto';
import { RuleBlockType, RuleTarget, SpaceEquipmentType } from 'src/lib/type';
import { v4 as uuidv4 } from 'uuid';

function getDate(
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
  hour: number,
  minute: number,
) {
  const now = new Date();

  let dayFlag = 8; // default: mon

  switch (day) {
    case 'mon':
      break;
    case 'tue':
      dayFlag = 2;
      break;
    case 'wed':
      dayFlag = 3;
      break;
    case 'thu':
      dayFlag = 4;
      break;
    case 'fri':
      dayFlag = 5;
      break;
    case 'sat':
      dayFlag = 6;
      break;
    case 'sun':
      dayFlag = 7;
      break;

    default:
      break;
  }

  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const daysUntilNextWeekDay = (dayFlag - dayOfWeek) % 7 || 7; // Calculate how many days until next Monday

  const nextWeekDay = new Date(now);
  nextWeekDay.setDate(now.getDate() + daysUntilNextWeekDay); // Move to next Monday
  nextWeekDay.setHours(hour, minute, 0, 0); // Set time to 09:00:00

  return nextWeekDay;
}

const testEmails = process.env.TEST_EMAILS?.split(',') ?? [];

if (testEmails.length !== 4) {
  throw new Error(
    'Provide 4 different emails for TEST_EMAILS in .env file: test1@example.com,test2@example.com,test3@example.com,test4@example.com',
  );
}

const createUserDtos: CreateUserDto[] = [];
while (createUserDtos.length < testEmails.length) {
  const name = `test-user-${createUserDtos.length}`;
  createUserDtos.push({
    name,
    email: testEmails[createUserDtos.length],
    country: 'KR',
    region: 'Seoul',
    city: 'Seoul',
  });
}

const createSpaceRuleBlockDtos: Partial<CreateRuleBlockDto>[] = [
  {
    id: uuidv4(),
    name: 'test General Space Access Rule [space1,space2,space3,space4]',
    type: RuleBlockType.spaceGeneral,
    content: 'All attendees must respect quiet hours between 10 PM and 7 AM.',
  },
  {
    id: uuidv4(),
    name: 'test Space Allowed Access Types [space1,space3]',
    type: RuleBlockType.spaceAccess,
    content: 'public:free;public:paid',
  },
  {
    id: uuidv4(),
    name: 'test Space Allowed Access Types [space2,space4]',
    type: RuleBlockType.spaceAccess,
    content: 'private:free;private:paid',
  },
  {
    id: uuidv4(),
    name: 'test Space Allowed Max Attendee count [space1,space3]',
    type: RuleBlockType.spaceMaxAttendee,
    content: '10',
  },
  {
    id: uuidv4(),
    name: 'test Space Allowed Max Attendee count [space2,space4]',
    type: RuleBlockType.spaceMaxAttendee,
    content: '20',
  },
  {
    id: uuidv4(),
    name: 'test Space Availability Weekdays [space1,space3]',
    type: RuleBlockType.spaceAvailability,
    content:
      'mon-09:00-18:00;tue-09:00-18:00;wed-09:00-18:00;thu-09:00-18:00;fri-09:00-18:00;',
  },
  {
    id: uuidv4(),
    name: 'test Space Availability WeekEnds [space2,space4]',
    type: RuleBlockType.spaceAvailability,
    content: 'sat-09:00-18:00;sun-09:00-18:00',
  },
  {
    id: uuidv4(),
    name: 'test Space Availability Unit 1h [space1,space3]',
    type: RuleBlockType.spaceAvailabilityUnit,
    content: '1h',
  },
  {
    id: uuidv4(),
    name: 'test Space Availability Unit 30m [space2,space4]',
    type: RuleBlockType.spaceAvailabilityUnit,
    content: '30m',
  },
  {
    id: uuidv4(),
    name: 'test Space Availability Buffer 5m [space1,space3]',
    type: RuleBlockType.spaceAvailabilityBuffer,
    content: '5m',
  },
  {
    id: uuidv4(),
    name: 'test Space Availability Buffer 30m [space2,space4]',
    type: RuleBlockType.spaceAvailabilityBuffer,
    content: '30m',
  },
  {
    id: uuidv4(),
    name: 'test Consent Collection Method over_50_yes [space1]',
    type: RuleBlockType.spaceConsentMethod,
    content: 'over_50_yes',
  },
  {
    id: uuidv4(),
    name: 'test Consent Collection Method over_30_yes [space2]',
    type: RuleBlockType.spaceConsentMethod,
    content: 'over_30_yes',
  },
  {
    id: uuidv4(),
    name: 'test Consent Collection Method under_50_no [space3]',
    type: RuleBlockType.spaceConsentMethod,
    content: 'under_50_no',
  },
  {
    id: uuidv4(),
    name: 'test Consent Collection Method is_100_yes [space4]',
    type: RuleBlockType.spaceConsentMethod,
    content: 'is_100_yes',
  },
  {
    id: uuidv4(),
    name: 'test Space Post Event Check [space1, space2, space3, space4]',
    type: RuleBlockType.spacePostEventCheck,
    content: 'Is space clean?',
  },
  {
    id: uuidv4(),
    name: 'test space pre-permission check food [space1,space2,space3,space4]',
    type: RuleBlockType.spacePrePermissionCheck,
    content: 'Will food or drinks be served at the event?^false',
  },
  {
    id: uuidv4(),
    name: 'test space pre-permission check alcholic drink [space1,space2,space3,space4]',
    type: RuleBlockType.spacePrePermissionCheck,
    content: 'Will alcholic drinks be served at the event?^false',
  },
];

const createSpaceRuleDtos: CreateRuleDto[] = [
  {
    name: 'test Space Rule 1',
    target: RuleTarget.space,
    ruleBlockIds: createSpaceRuleBlockDtos
      .filter((item) => item.name.includes('space1'))
      .map((item) => item.id),
  },
  {
    name: 'test Space Rule 2',
    target: RuleTarget.space,
    ruleBlockIds: createSpaceRuleBlockDtos
      .filter((item) => item.name.includes('space2'))
      .map((item) => item.id),
  },
  {
    name: 'test Space Rule 3',
    target: RuleTarget.space,
    ruleBlockIds: createSpaceRuleBlockDtos
      .filter((item) => item.name.includes('space3'))
      .map((item) => item.id),
  },
  {
    name: 'test Space Rule 4',
    target: RuleTarget.space,
    ruleBlockIds: createSpaceRuleBlockDtos
      .filter((item) => item.name.includes('space4'))
      .map((item) => item.id),
  },
];

const createSpaceDtos: Partial<CreateSpaceDto>[] = [
  {
    name: 'test Space 1',
    country: 'KR',
    region: 'Seoul',
    city: 'Seoul',
    district: '용산구',
    address: '서울특별시 용산구 백범로47길 28',
    zipcode: '11344',
    latitude: '37.541036',
    longitude: '126.959758',
    // ruleId:,
    details: 'Residence near by Hyochang Park',
  },
  {
    name: 'test Space 2',
    country: 'UK',
    region: 'Salisbury',
    city: 'Salisbury',
    district: 'Salisbury',
    address: 'Salisbury SP4 7DE, United Kingdom',
    zipcode: 'SP4 7DE',
    latitude: '51.17900303617598',
    longitude: '-1.8261613569793258',
    // ruleId:,
    details: 'Stonehenge',
  },
  {
    name: 'test Space 3',
    country: 'IR',
    region: 'Fars',
    city: 'Fars',
    district: 'Fars',
    address: 'Fars Province, Takht-e Jamshid، WVMP+6MV, Iran',
    zipcode: 'WVMP+6MV',
    latitude: '29.93415314109646',
    longitude: '52.88635199816217',
    // ruleId:,
    details: 'Persepolis',
  },
  {
    name: 'test Space 4',
    country: 'AU',
    region: 'Victoria',
    city: 'Portsea',
    district: 'Portsea',
    address: 'Ochiltree Rd, Portsea VIC 3944, Australia',
    zipcode: 'VIC 3944',
    latitude: '-38.31362130473114',
    longitude: '144.69370436853146',
    // ruleId,
    details: 'Point Nepean National Park',
  },
];

const createSpaceEquipmentDtos: Partial<CreateSpaceEquipmentDto>[] = [
  // space1
  {
    // spaceId
    name: '[space1] Macbook Pro 14',
    type: SpaceEquipmentType.computer,
    quantity: 1,
    details: 'Computation equipment',
  },
  // space2
  {
    // spaceId
    name: '[space2] Shuttle Bus',
    type: SpaceEquipmentType.facility,
    quantity: 5,
    details: 'Transportation',
  },
  // space3
  {
    // spaceId
    name: '[space3] Stone Pillar',
    type: SpaceEquipmentType.facility,
    quantity: 100,
    details: 'Ancient stone monuments',
  },
  // space4
  {
    // spaceId
    name: '[space4] Bicycle',
    type: SpaceEquipmentType.sports,
    quantity: 10,
    details: 'Transportation',
  },
];

const createSpaceEventRuleBlockDtos: Partial<CreateRuleBlockDto>[] = [
  {
    id: uuidv4(),
    name: 'test Event Noise Level Control [event1]',
    type: RuleBlockType.spaceEventNoiseLevel,
    content: 'low',
  },
  {
    id: uuidv4(),
    name: 'test Event Noise Level Control [event2]',
    type: RuleBlockType.spaceEventNoiseLevel,
    content: 'low',
  },
  {
    id: uuidv4(),
    name: 'test Event Noise Level Control [event3]',
    type: RuleBlockType.spaceEventNoiseLevel,
    content: 'low',
  },
  {
    id: uuidv4(),
    name: 'test Event Noise Level Control [event4]',
    type: RuleBlockType.spaceEventNoiseLevel,
    content: 'low',
  },
  {
    id: uuidv4(),
    name: 'test Food Service [event1, event3]',
    type: RuleBlockType.spaceEventPrePermissionCheckAnswer,
    content: `${createSpaceRuleBlockDtos.find((item) => item.name.includes('food')).id}^true`,
  },
  {
    id: uuidv4(),
    name: 'test Food Service [event2, event4]',
    type: RuleBlockType.spaceEventPrePermissionCheckAnswer,
    content: `${createSpaceRuleBlockDtos.find((item) => item.name.includes('food')).id}^true`,
  },
  {
    id: uuidv4(),
    name: 'test Alcholic drink Service [event1, event3]',
    type: RuleBlockType.spaceEventPrePermissionCheckAnswer,
    content: `${createSpaceRuleBlockDtos.find((item) => item.name.includes('alcholic')).id}^true`,
  },
  {
    id: uuidv4(),
    name: 'test Alcholic drink Service [event2, event4]',
    type: RuleBlockType.spaceEventPrePermissionCheckAnswer,
    content: `${createSpaceRuleBlockDtos.find((item) => item.name.includes('alcholic')).id}^false`,
  },
  {
    id: uuidv4(),
    name: 'test Insurance Documentation [event1]',
    type: RuleBlockType.spaceEventInsurance,
    files: [
      {
        originalname: 'insurance_doc.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('Example insurance document content'),
        size: 67890,
      } as Express.Multer.File,
    ],
    content:
      'https://permissioning-the-city.s3.ap-northeast-2.amazonaws.com/70047e97-406c-467b-ba3d-a26186406ddf_Correlation+between+density+of+Monochamus+spp.+with+Bursaphelenchus+xylophilus+and+distance+from+pine+wilt+disease+affected+area+interface.pdf',
  },
  {
    id: uuidv4(),
    name: 'test Event Expected Attendee Count [event1, event2]',
    type: RuleBlockType.spaceEventExpectedAttendeeCount,
    content: '50', // Maximum attendees allowed
  },
  {
    id: uuidv4(),
    name: 'test Event Expected Attendee Count [event3, event4]',
    type: RuleBlockType.spaceEventExpectedAttendeeCount,
    content: '10', // Maximum attendees allowed
  },
  {
    id: uuidv4(),
    name: 'test Event Equipment Requirements [event1]',
    type: RuleBlockType.spaceEventRequireEquipment,
    // content: '{uuid}:2, {uuid}:4', // Will be filled after spaceEquipment insert
  },
  {
    id: uuidv4(),
    name: 'test Event Equipment Requirements [event2]',
    type: RuleBlockType.spaceEventRequireEquipment,
    // content: '{uuid}:2, {uuid}:4', // Will be filled after spaceEquipment insert
  },
  {
    id: uuidv4(),
    name: 'test Event Equipment Requirements [event3]',
    type: RuleBlockType.spaceEventRequireEquipment,
    // content: '{uuid}:2, {uuid}:4', // Will be filled after spaceEquipment insert
  },
  {
    id: uuidv4(),
    name: 'test Event Equipment Requirements [event4]',
    type: RuleBlockType.spaceEventRequireEquipment,
    // content: '{uuid}:2, {uuid}:4', // Will be filled after spaceEquipment insert
  },
  {
    id: uuidv4(),
    name: 'test Space Eevent Benefit [space1, space2, space3, space4]',
    type: RuleBlockType.spaceEventBenefit,
    content: 'Good to have a test event',
  },
  {
    id: uuidv4(),
    name: 'test Space Eevent Risk [space1, space2, space3, space4]',
    type: RuleBlockType.spaceEventRisk,
    content: 'It is only a test',
  },
  {
    id: uuidv4(),
    name: 'test Space Eevent Self Risk Assesment [space1, space2, space3, space4]',
    type: RuleBlockType.spaceEventSelfRiskAssesment,
    content: 'Will debug if error is thrown',
  },
  {
    id: uuidv4(),
    name: 'test Event exception [event1]',
    type: RuleBlockType.spaceEventException,
    content: `${createSpaceRuleBlockDtos.find((item) => item.type === RuleBlockType.spaceAvailabilityBuffer && item.name.includes('space1')).id}^40m^Need more time to clean up`,
  },
];

const createSpaceEventRuleDtos: CreateRuleDto[] = [
  {
    name: 'test Event Rule 1',
    target: RuleTarget.spaceEvent,
    ruleBlockIds: createSpaceEventRuleBlockDtos
      .filter((item) => item.name.includes('event1'))
      .map((item) => item.id),
  },
  {
    name: 'test Event Rule 2',
    target: RuleTarget.spaceEvent,
    ruleBlockIds: createSpaceEventRuleBlockDtos
      .filter((item) => item.name.includes('event2'))
      .map((item) => item.id),
  },
  {
    name: 'test Event Rule 3',
    target: RuleTarget.spaceEvent,
    ruleBlockIds: createSpaceEventRuleBlockDtos
      .filter((item) => item.name.includes('event3'))
      .map((item) => item.id),
  },
  {
    name: 'test Event Rule 4',
    target: RuleTarget.spaceEvent,
    ruleBlockIds: createSpaceEventRuleBlockDtos
      .filter((item) => item.name.includes('event4'))
      .map((item) => item.id),
  },
];

const createSpaceEventDtos: Partial<CreateSpaceEventDto>[] = [
  {
    name: 'test Event 1',
    // spaceId: '',
    // ruleId: '',
    details: 'event1 at space1',
    duration: '1h',
    startsAt: getDate('mon', 9, 0),
  },
  {
    name: 'test Event 2',
    // spaceId: '',
    // ruleId: '',
    details: 'event2 at space2',
    duration: '2h',
    startsAt: getDate('sat', 13, 0),
  },
  {
    name: 'test Event 3',
    // spaceId: '',
    // ruleId: '',
    details: 'event3 at space3',
    duration: '3h',
    startsAt: getDate('fri', 15, 0),
  },
  {
    name: 'test Event 4',
    // spaceId: '',
    // ruleId: '',
    details: 'event4 at space4',
    duration: '4h',
    startsAt: getDate('sun', 9, 0),
  },
];
const createSpacePermissionerDtos: Partial<CreateSpacePermissionerDto>[] = [];
const createPermissionRequestDtos: Partial<CreatePermissionRequestDto>[] = [];
const createPermissionResponseDtos: Partial<CreatePermissionResponseDto>[] = [];

const createUserNotificationDtos: Partial<CreateUserNotificationDto>[] = [];

const createSpaceImageDtos: Partial<CreateSpaceImageDto>[] = [
  {
    id: 'aa0a6de4-3df3-4d1b-a579-6e17ce867d6c',
    link: 'https://permissioning-the-city.s3.ap-northeast-2.amazonaws.com/aa0a6de4-3df3-4d1b-a579-6e17ce867d6c_0c4412c86177bbac5b35cf5d6fa0aae3.jpg',
  },
  {
    id: 'd3bcebbf-a2f7-4475-b113-3025ce57d828',
    link: 'https://permissioning-the-city.s3.ap-northeast-2.amazonaws.com/d3bcebbf-a2f7-4475-b113-3025ce57d828_9898a2abda6cc262f7706ed4330fad08.jpg',
  },
  {
    id: 'a3cdd311-f9bb-4254-aa38-311f14d91ffb',
    link: 'https://permissioning-the-city.s3.ap-northeast-2.amazonaws.com/a3cdd311-f9bb-4254-aa38-311f14d91ffb_6ad51f21eb41d6cdd002f2c8f38c4f21.jpg',
  },
  {
    id: '86f2000b-48b3-48b4-b35c-343cbe6e1348',
    link: 'https://permissioning-the-city.s3.ap-northeast-2.amazonaws.com/86f2000b-48b3-48b4-b35c-343cbe6e1348_4e20f9cdcdbd18674f552dde21d8cf05.jpg',
  },
];
const createSpaceEventImageDtos: Partial<CreateSpaceEventImageDto>[] = [
  {
    id: '8a0a1469-467f-47bd-b6db-d09d3bde7de8',
    link: 'https://permissioning-the-city.s3.ap-northeast-2.amazonaws.com/8a0a1469-467f-47bd-b6db-d09d3bde7de8_photo-1471478331149-c72f17e33c73.jpg',
  },
  {
    id: 'd2f2cd77-8dc2-42d0-a712-84307494d538',
    link: 'https://permissioning-the-city.s3.ap-northeast-2.amazonaws.com/d2f2cd77-8dc2-42d0-a712-84307494d538_photo-1504609813442-a8924e83f76e.jpg',
  },
  {
    id: 'cfa748e4-8938-4b7c-bc29-8eddebc2e933',
    link: 'https://permissioning-the-city.s3.ap-northeast-2.amazonaws.com/cfa748e4-8938-4b7c-bc29-8eddebc2e933_photo-1504639725590-34d0984388bd.jpg',
  },
  {
    id: 'fa4076f3-94c0-4098-bdc3-2220c16ddc77',
    link: 'https://permissioning-the-city.s3.ap-northeast-2.amazonaws.com/fa4076f3-94c0-4098-bdc3-2220c16ddc77_photo-1510894347713-fc3ed6fdf539.jpg',
  },
  {
    id: '4be13f71-e3d0-477b-b724-157107635dc2',
    link: 'https://permissioning-the-city.s3.ap-northeast-2.amazonaws.com/4be13f71-e3d0-477b-b724-157107635dc2_photo-1513618827672-0d7c5ad591b1.jpg',
  },
  {
    id: 'f0f5cc1c-baff-41d9-8692-a188c5b9fb41',
    link: 'https://permissioning-the-city.s3.ap-northeast-2.amazonaws.com/f0f5cc1c-baff-41d9-8692-a188c5b9fb41_premium_photo-1661380954234-13d98a83577c.jpg',
  },
  {
    id: 'e44e9164-2b44-4278-85f0-8e22e6284b67',
    link: 'https://permissioning-the-city.s3.ap-northeast-2.amazonaws.com/e44e9164-2b44-4278-85f0-8e22e6284b67_premium_photo-1670315264879-59cc6b15db5f.jpg',
  },
  {
    id: 'ce89e138-2b6d-47c0-9048-d44da0a7d4bf',
    link: 'https://permissioning-the-city.s3.ap-northeast-2.amazonaws.com/ce89e138-2b6d-47c0-9048-d44da0a7d4bf_premium_photo-1680286739871-01142bc609df.jpg',
  },
  {
    id: 'bef9bdb6-a015-4138-876b-611a099575ea',
    link: 'https://permissioning-the-city.s3.ap-northeast-2.amazonaws.com/bef9bdb6-a015-4138-876b-611a099575ea_premium_photo-1683707120403-9add00a6140e.jpg',
  },
  {
    id: '3553b1f9-08d7-4162-8027-4fd9c19e0307',
    link: 'https://permissioning-the-city.s3.ap-northeast-2.amazonaws.com/3553b1f9-08d7-4162-8027-4fd9c19e0307_premium_photo-1705407454980-4b8b64d068b8.jpg',
  },
];

export const mockup = {
  createUserDtos,
  createUserNotificationDtos,
  createSpaceRuleBlockDtos,
  createSpaceRuleDtos,
  createSpaceDtos,
  createSpaceImageDtos,
  createSpaceEventRuleBlockDtos,
  createSpaceEventRuleDtos,
  createSpaceEquipmentDtos,
  createSpaceEventDtos,
  createSpaceEventImageDtos,
  createSpacePermissionerDtos,
  createPermissionRequestDtos,
  createPermissionResponseDtos,
};
