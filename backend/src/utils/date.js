import ApiError from "./ApiError.js";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DAY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/;

export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function assertMonth(value) {
  if (!MONTH_PATTERN.test(String(value || ""))) {
    throw new ApiError(400, "month must use the YYYY-MM format");
  }
  return String(value);
}

export function getMonthRange(month) {
  const normalizedMonth = assertMonth(month);
  const [year, monthNumber] = normalizedMonth.split("-").map(Number);
  const start = new Date(Date.UTC(year, monthNumber - 1, 1));
  const end = new Date(Date.UTC(year, monthNumber, 1));

  return { month: normalizedMonth, start, end };
}

export function getDayRange(day) {
  const normalizedDay = String(day || "");
  const match = DAY_PATTERN.exec(normalizedDay);
  if (!match) throw new ApiError(400, "date must use the YYYY-MM-DD format");

  const year = Number(match[0].slice(0, 4));
  const month = Number(match[0].slice(5, 7));
  const dayOfMonth = Number(match[0].slice(8, 10));
  const start = new Date(Date.UTC(year, month - 1, dayOfMonth));

  if (start.getUTCFullYear() !== year || start.getUTCMonth() !== month - 1 || start.getUTCDate() !== dayOfMonth) {
    throw new ApiError(400, "date must be a valid calendar date");
  }

  const end = new Date(Date.UTC(year, month - 1, dayOfMonth + 1));
  return { date: normalizedDay, start, end };
}

export function parseDate(value, fieldName = "date") {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `${fieldName} must be a valid date`);
  }
  return date;
}

export function monthKeysEndingAt(month, count = 6) {
  const normalizedMonth = assertMonth(month);
  const [year, monthNumber] = normalizedMonth.split("-").map(Number);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(year, monthNumber - count + index, 1));
    return date.toISOString().slice(0, 7);
  });
}
