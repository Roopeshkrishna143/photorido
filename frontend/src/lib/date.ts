const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseDateOnlyValue(value: string) {
  const match = value.trim().match(DATE_ONLY_PATTERN);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime())
    || date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function resolveDateValue(value: string | Date) {
  if (value instanceof Date) {
    return value;
  }

  return parseDateOnlyValue(value) ?? new Date(value);
}

export function isDateOnlyString(value: string) {
  return DATE_ONLY_PATTERN.test(value.trim());
}

export function formatDateInputValue(value: Date) {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

export function formatDisplayDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
  locale = "en-IN",
) {
  const date = resolveDateValue(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "";
  }

  return date.toLocaleDateString(locale, options);
}

export function formatDisplayDateTime(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
  locale = "en-IN",
) {
  const date = resolveDateValue(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "";
  }

  return date.toLocaleString(locale, options);
}
