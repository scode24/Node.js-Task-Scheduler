const dayjs = require("dayjs");

/**
 * Checks if a date is a weekend.
 * @param {dayjs.Dayjs} d - The date to check.
 * @returns {boolean} True if weekend.
 */
function isWeekend(d) {
  const day = d.day();
  return day === 0 || day === 6;
}

/**
 * Finds the next working day from a given date.
 * @param {dayjs.Dayjs|string} date - Starting date.
 * @param {Array} offDays - Array of off day strings.
 * @param {number} maxDays - Max days to look ahead.
 * @returns {dayjs.Dayjs} The next working day.
 */
function nextWorkingDay(date, offDays = [], maxDays) {
  let d = dayjs(date);

  for (let i = 0; i < maxDays; i++) {
    if (!isWeekend(d) && !offDays.includes(d.format("YYYY-MM-DD"))) {
      return d;
    }
    d = d.add(1, "day");
  }

  throw new Error("Exceeded max date lookup in nextWorkingDay");
}

/**
 * Calculates the end date for a task based on duration.
 * @param {dayjs.Dayjs} start - Start date.
 * @param {number} durationDays - Duration in days.
 * @param {Array} offDays - Off days.
 * @param {number} maxDays - Max days to look ahead.
 * @returns {dayjs.Dayjs} The end date.
 */
function calculateEndDate(start, durationDays, offDays = [], maxDays) {
  let d = dayjs(start);
  let worked = 0;
  const needed = Math.ceil(durationDays);

  for (let i = 0; i < maxDays; i++) {
    if (!isWeekend(d) && !offDays.includes(d.format("YYYY-MM-DD"))) {
      worked++;
      if (worked === needed) return d;
    }
    d = d.add(1, "day");
  }

  throw new Error("Exceeded max date lookup in calculateEndDate");
}

module.exports = {
  isWeekend,
  nextWorkingDay,
  calculateEndDate,
};
