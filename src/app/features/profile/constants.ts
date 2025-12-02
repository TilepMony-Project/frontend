export const PROFILE_TIMEZONES = [
  { value: "UTC", label: "UTC — Coordinated Universal Time" },
  { value: "America/New_York", label: "GMT-05:00 — New York" },
  { value: "America/Los_Angeles", label: "GMT-08:00 — Los Angeles" },
  { value: "Europe/London", label: "GMT+00:00 — London" },
  { value: "Europe/Berlin", label: "GMT+01:00 — Berlin" },
  { value: "Asia/Dubai", label: "GMT+04:00 — Dubai" },
  { value: "Asia/Jakarta", label: "GMT+07:00 — Jakarta" },
  { value: "Asia/Singapore", label: "GMT+08:00 — Singapore" },
  { value: "Asia/Tokyo", label: "GMT+09:00 — Tokyo" },
  { value: "Australia/Sydney", label: "GMT+10:00 — Sydney" },
] as const;

export const PROFILE_TIMEZONE_VALUES = PROFILE_TIMEZONES.map((tz) => tz.value);
