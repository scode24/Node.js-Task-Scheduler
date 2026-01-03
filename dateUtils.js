const dayjs = require("dayjs");

function isWeekend(d) {
  const day = d.day();
  return day === 0 || day === 6;
}

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
  nextWorkingDay,
  calculateEndDate,
};
