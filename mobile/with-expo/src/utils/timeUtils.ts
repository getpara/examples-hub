type Units = "year" | "month" | "week" | "day" | "hour" | "minute" | "second";

const SEC = 1;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

interface FormatDurationOpts {
  maxUnits?: number;
  locale?: string;
  narrowSpace?: boolean;
}

export function formatDuration(
  totalSeconds: number,
  { maxUnits = 2, locale, narrowSpace = true }: FormatDurationOpts = {}
): string {
  const parts: string[] = [];
  let remaining = Math.floor(Math.abs(totalSeconds));

  const push = (value: number, unit: Units) => {
    if (!value) return;
    const rtf = new Intl.PluralRules(locale, { type: "cardinal" });
    const plural = rtf.select(value);
    const label = {
      year: { one: "y", other: "y" },
      month: { one: "mo", other: "mos" },
      week: { one: "w", other: "w" },
      day: { one: "d", other: "d" },
      hour: { one: "h", other: "h" },
      minute: { one: "m", other: "m" },
      second: { one: "s", other: "s" },
    }[unit][plural as "one" | "other"];
    parts.push(`${value}${narrowSpace ? "\u202F" : " "}${label}`);
  };

  const extract = (unitSize: number) => {
    const v = Math.floor(remaining / unitSize);
    remaining -= v * unitSize;
    return v;
  };

  push(extract(YEAR), "year");
  push(extract(MONTH), "month");
  push(extract(WEEK), "week");
  push(extract(DAY), "day");
  push(extract(HOUR), "hour");
  push(extract(MIN), "minute");
  push(extract(SEC), "second");

  return parts.slice(0, maxUnits).join(" ");
}

export function formatRelativeTime(timestamp: number | Date, { locale }: { locale?: string } = {}): string {
  const now = Date.now();
  const ms = (timestamp instanceof Date ? timestamp.getTime() : timestamp) - now;

  const absSec = Math.abs(ms) / 1_000;
  const { value, unit }: { value: number; unit: Units } =
    absSec >= YEAR
      ? { value: ms / (YEAR * 1_000), unit: "year" }
      : absSec >= MONTH
      ? { value: ms / (MONTH * 1_000), unit: "month" }
      : absSec >= WEEK
      ? { value: ms / (WEEK * 1_000), unit: "week" }
      : absSec >= DAY
      ? { value: ms / (DAY * 1_000), unit: "day" }
      : absSec >= HOUR
      ? { value: ms / (HOUR * 1_000), unit: "hour" }
      : absSec >= MIN
      ? { value: ms / (MIN * 1_000), unit: "minute" }
      : { value: ms / 1_000, unit: "second" };

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  return rtf.format(Math.round(value), unit);
}

interface FormatDateOpts extends Intl.DateTimeFormatOptions {
  locale?: string;
}

export const fromUnix = (seconds: number) => new Date(seconds * 1_000);

export const toUnix = (date: Date) => Math.floor(date.getTime() / 1_000);

export function formatDateTime(input: number | Date, { locale, ...options }: FormatDateOpts = {}): string {
  const date = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  }).format(date);
}
