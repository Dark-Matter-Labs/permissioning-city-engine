import * as crypto from 'crypto';
import * as cheerio from 'cheerio';
import { DayOfWeek, RuleBlockContentDivider } from '../type';
import dayjs, { ManipulateType } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import abbrTimezone from 'dayjs-abbr-timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(abbrTimezone);

export const hash = (str: string) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

export const generateRandomCode = (length = 8) => {
  const characters =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = bytes[i] % characters.length;
    result += characters[randomIndex];
  }

  return result;
};

export const getDayIndex = (day: DayOfWeek): number => {
  let index = 0;

  switch (day) {
    case 'sun':
      index = 0;
      break;
    case 'mon':
      index = 1;
      break;
    case 'tue':
      index = 2;
      break;
    case 'wed':
      index = 3;
      break;
    case 'thu':
      index = 4;
      break;
    case 'fri':
      index = 5;
      break;
    case 'sat':
      index = 6;
      break;

    default:
      break;
  }

  return index;
};

export const parseTimeManipulation = (manupulation: string) => {
  const match = manupulation.match(/^(\d+)([dwMyhms]+)$/);
  const numberPart = parseInt(match[1], 10);
  const stringPart = match[2];

  return {
    numberPart,
    stringPart,
  };
};

export type GetAvailabilityIntervalsOption = {
  startDate: Date;
  endDate: Date;
  unit: string;
  buffer: string;
  availabilities: string[];
  unavailableRanges: {
    startTime: Date;
    endTime: Date;
    buffer: string;
    bufferMillis?: number;
  }[];
  timezone: string;
};

export const getAvailabilityIntervals = (
  option: GetAvailabilityIntervalsOption,
) => {
  const {
    startDate,
    endDate,
    unit,
    buffer,
    availabilities,
    unavailableRanges,
    timezone,
  } = option;

  const MAX_INTERVALS = 100000;
  const MAX_ITERATIONS = 31 * 24 * 60 * 60 * 1000;
  const intervals = [];
  let currentDate = dayjs(startDate).tz(timezone).startOf('day');
  const finalDate = dayjs(endDate).tz(timezone).add(1, 'day').endOf('day');
  const nowDate = dayjs().tz(timezone);

  // Parse the unit (e.g., '30m', '1h', '1d') and get the corresponding milliseconds
  const unitAmount = parseInt(unit.slice(0, -1), 10); // Extract the number (30, 1, etc.)
  const unitType = unit.slice(-1); // Extract the unit type ('m', 'h', 'd')
  const bufferAmount = parseInt(buffer.slice(0, -1), 10); // Extract the number (30, 1, etc.)
  const bufferType = buffer.slice(-1); // Extract the buffer type ('m', 'h', 'd')

  let unitMillis;
  switch (unitType) {
    case 'm': // minutes
      unitMillis = unitAmount * 60 * 1000;
      break;
    case 'h': // hours
      unitMillis = unitAmount * 60 * 60 * 1000;
      break;
    case 'd': // days
      unitMillis = unitAmount * 24 * 60 * 60 * 1000;
      break;
    default:
      throw new Error('Invalid unit type. Use "m", "h", or "d".');
  }

  if (
    (finalDate.toDate().getTime() - startDate.getTime()) / unitMillis >
    MAX_ITERATIONS
  ) {
    throw new Error('Date range too large to process');
  }

  const availabilityMap = new Map<string, string[]>();
  availabilities.forEach((item) => {
    const [day] = item.split(RuleBlockContentDivider.time);
    if (!availabilityMap.has(day)) {
      availabilityMap.set(day, []);
    }
    availabilityMap.get(day).push(item);
  });

  unavailableRanges.map((item) => {
    const { buffer } = item;
    const bufferAmount = parseInt(buffer.slice(0, -1), 10); // Extract the number (30, 1, etc.)
    const bufferType = buffer.slice(-1); // Extract the buffer type ('m', 'h', 'd')

    switch (bufferType) {
      case 'm': // minutes
        item.bufferMillis = bufferAmount * 60 * 1000;
        break;
      case 'h': // hours
        item.bufferMillis = bufferAmount * 60 * 60 * 1000;
        break;
      case 'd': // days
        item.bufferMillis = bufferAmount * 24 * 60 * 60 * 1000;
        break;
      default:
        throw new Error('Invalid buffer type. Use "m", "h", or "d".');
    }
  });

  const currentDayString = currentDate.format('ddd').toLowerCase();
  const firstAvailabilityRanges = availabilityMap.get(currentDayString) || [];
  const firstAvailability = firstAvailabilityRanges[0];
  if (firstAvailability) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, firstStartTime] = firstAvailability.split(
      RuleBlockContentDivider.time,
    );
    const [firstHour, firstMinute] = firstStartTime.split(':');

    currentDate = currentDate
      .tz(timezone)
      .hour(Number(firstHour))
      .minute(Number(firstMinute));
  }

  // Loop through the date range and create the intervals
  while (currentDate < finalDate) {
    if (intervals.length > MAX_INTERVALS) {
      throw new Error(
        'Too many intervals generated. Reduce the date range or change unit size.',
      );
    }
    const currentDayString = currentDate.format('ddd').toLowerCase();
    const availabilityRanges = availabilityMap.get(currentDayString) || [];

    let nextDate = currentDate
      .tz(timezone)
      .add(unitAmount, unitType as ManipulateType)
      .add(bufferAmount, bufferType as ManipulateType);

    const reservation = unavailableRanges.find(
      (item) =>
        dayjs(item.startTime).tz(timezone) <= currentDate &&
        dayjs(item.endTime).tz(timezone) >= nextDate,
    );
    // reset buffer offset for new date
    if (currentDate.format('ddd') !== nextDate.format('ddd')) {
      const nextAvailabilityRanges =
        availabilityMap.get(nextDate.format('ddd').toLowerCase()) || [];
      const nextAvailability = nextAvailabilityRanges[0];
      if (nextAvailability) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, nextStartTime] = nextAvailability.split(
          RuleBlockContentDivider.time,
        );
        const [nextHour, nextMinute] = nextStartTime.split(':');
        nextDate = nextDate
          .tz(timezone)
          .hour(Number(nextHour))
          .minute(Number(nextMinute));
      }
    }

    if (nextDate > dayjs(endDate).tz(timezone)) break;

    for (const availability of availabilityRanges) {
      const [day, startTime, endTime] = availability.split(
        RuleBlockContentDivider.time,
      );
      const [startHour, startMinute] = startTime.split(':');
      const [endHour, endMinute] = endTime.split(':');
      const startPoint = currentDate
        .tz(timezone)
        .hour(Number(startHour))
        .minute(Number(startMinute));

      const endPoint = currentDate
        .tz(timezone)
        .hour(Number(endHour))
        .minute(Number(endMinute));

      if (
        currentDate.format('ddd').toLowerCase() === day &&
        startPoint <= currentDate &&
        endPoint >= nextDate &&
        startPoint >= nowDate
      ) {
        if (!!reservation === false) {
          intervals.push({
            startTime: currentDate.toDate(),
            endTime: nextDate.toDate(),
          });
          break;
        }
      }
    }

    // Move to the next interval
    currentDate = nextDate;
  }

  return intervals;
};

// Convert time to a comparable value (HH:MM as string)
export const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const isInAvailabilities = (
  availabilities: string[],
  startTime: Date,
  endTime: Date,
): boolean => {
  // Parse availability into a map { 'mon': { start: '09:30', end: '18:05' }, ... }
  const availabilityMap = availabilities.reduce(
    (map, entry) => {
      const [day, start, end] = entry.split('-');
      map[day.toLowerCase()] = { start, end };
      return map;
    },
    {} as Record<string, { start: string; end: string }>,
  );

  // Get the weekday (0 = Sunday, 1 = Monday, etc.)
  const dayNames = [
    DayOfWeek.sun,
    DayOfWeek.mon,
    DayOfWeek.tue,
    DayOfWeek.wed,
    DayOfWeek.thu,
    DayOfWeek.fri,
    DayOfWeek.sat,
  ];
  const startDay = dayNames[startTime.getUTCDay()];
  const endDay = dayNames[endTime.getUTCDay()];

  const startFormatted = formatTime(startTime);
  const endFormatted = formatTime(endTime);

  // Check if start and end times fall within the availability for each day
  if (availabilityMap[startDay] && availabilityMap[endDay]) {
    const startAvailable = availabilityMap[startDay];
    const endAvailable = availabilityMap[endDay];

    // Compare start and end times with availability
    const isStartValid =
      startFormatted >= startAvailable.start &&
      startFormatted <= startAvailable.end;
    const isEndValid =
      endFormatted >= endAvailable.start && endFormatted <= endAvailable.end;

    return isStartValid && isEndValid;
  }

  return false;
};

export const selectHtmlElement = (html: string, selector: string): string => {
  const body = html?.split('<body>')?.[1]?.split('</body>')?.[0] ?? html;
  const $ = cheerio.load(body.trim());
  const selectedElement = $(selector).html();

  return selectedElement;
};
