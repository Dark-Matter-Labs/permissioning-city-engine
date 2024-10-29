import * as crypto from 'crypto';

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
  unit: '30m' | '1h' | '1d' = '1h',
  availabilities: string[],
  unavailableRanges: { startTime: Date; endTime: Date }[],
) => {
  const intervals = [];
  let currentDate = new Date(startDate.getTime()); // Clone the start date

  // Parse the unit (e.g., '30m', '1h', '1d') and get the corresponding milliseconds
  const unitAmount = parseInt(unit.slice(0, -1), 10); // Extract the number (30, 1, etc.)
  const unitType = unit.slice(-1); // Extract the unit type ('m', 'h', 'd')

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

  // Loop through the date range and create the intervals
  while (currentDate < endDate) {
    const nextDate = new Date(currentDate.getTime() + unitMillis);
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

    for (const availability of availabilityRanges) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_day, startTime, endTime] = availability.split('-');
      const [startHour, startMinute] = startTime.split(':');
      const [endHour, endMinute] = endTime.split(':');
      const startDate = new Date(currentDate);
      startDate.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
      const endDate = new Date(currentDate);
      endDate.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      if (startDate <= new Date(currentDate) && endDate >= new Date(nextDate)) {
        if (
          !unavailableRanges.find(
            (item) =>
              new Date(item.startTime) <= new Date(currentDate) &&
              new Date(item.endTime) >= new Date(nextDate),
          )
        ) {
          intervals.push({
            startTime: new Date(currentDate),
            endTime: new Date(nextDate),
          });
          break;
        }
      }
    }

    currentDate = nextDate; // Move to the next interval
  }

  return intervals;
};
