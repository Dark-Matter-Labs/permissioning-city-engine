import * as crypto from 'crypto';
import { RuleBlockContentDivider } from '../type';

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

export const getTimeIntervals = (
  startDate: Date,
  endDate: Date,
  unit: string,
  availabilities: string[],
  unavailableRanges: {
    startTime: Date;
    endTime: Date;
    buffer: string;
    bufferMillis?: number;
  }[],
) => {
  const intervals = [];
  let currentDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
    0,
    0,
    0,
    0,
  );
  const finalDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate() + 1,
    0,
    0,
    0,
    0,
  );

  // Parse the unit (e.g., '30m', '1h', '1d') and get the corresponding milliseconds
  const unitAmount = parseInt(unit.slice(0, -1), 10); // Extract the number (30, 1, etc.)
  const unitType = unit.slice(-1); // Extract the unit type ('m', 'h', 'd')
  // const bufferAmount = parseInt(buffer.slice(0, -1), 10); // Extract the number (30, 1, etc.)
  // const bufferType = buffer.slice(-1); // Extract the buffer type ('m', 'h', 'd')

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

  let isReservedDay = false;
  let reservationBufferMillies = 0;

  // Loop through the date range and create the intervals
  while (currentDate < finalDate) {
    let nextDate = new Date(currentDate.getTime() + unitMillis);

    // reset buffer offset for new date
    if (isReservedDay === true && currentDate.getDate() < nextDate.getDate()) {
      isReservedDay = false;
      currentDate = new Date(currentDate.getTime() - reservationBufferMillies);
      nextDate = new Date(currentDate.getTime() + unitMillis);
    }

    if (nextDate > endDate) break;

    const nextDay = nextDate.getDay();
    let nextDayString = null;

    switch (nextDay) {
      case 0:
        nextDayString = 'sun';
        break;
      case 1:
        nextDayString = 'mon';
        break;
      case 2:
        nextDayString = 'tue';
        break;
      case 3:
        nextDayString = 'wed';
        break;
      case 4:
        nextDayString = 'thu';
        break;
      case 5:
        nextDayString = 'fri';
        break;
      case 6:
        nextDayString = 'sat';
        break;

      default:
        break;
    }

    const availabilityRanges = availabilities.filter((item) =>
      item.startsWith(nextDayString),
    );
    const reservation = unavailableRanges.find(
      (item) =>
        new Date(item.startTime) <= new Date(currentDate) &&
        new Date(new Date(item.endTime).getTime() + item.bufferMillis) >=
          new Date(nextDate),
    );
    if (!!reservation) {
      reservationBufferMillies += reservation?.bufferMillis ?? 0;
    }

    for (const availability of availabilityRanges) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_day, startTime, endTime] = availability.split(
        RuleBlockContentDivider.time,
      );
      const [startHour, startMinute] = startTime.split(':');
      const [endHour, endMinute] = endTime.split(':');
      const startDate = new Date(currentDate);
      startDate.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
      const endDate = new Date(currentDate);
      endDate.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      if (startDate <= new Date(currentDate) && endDate >= new Date(nextDate)) {
        if (!!reservation === false) {
          intervals.push({
            startTime: new Date(currentDate),
            endTime: new Date(nextDate),
          });
          break;
        }
      }
    }

    // Move to the next interval
    currentDate = new Date(nextDate.getTime());
    if (!!reservation === true) {
      // Add buffer if event exists
      isReservedDay = true;
      currentDate = new Date(currentDate.getTime() + reservation.bufferMillis);
    }
  }

  return intervals;
};
