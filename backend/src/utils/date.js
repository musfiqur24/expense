import ApiError from "./ApiError.js";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

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
