export function computeCurrentStreakFromDates(
  dates: Array<Date | null | undefined>,
) {
  const uniqueDays = new Set<string>();
  for (const date of dates) {
    if (!date) continue;
    uniqueDays.add(toDayKey(date));
  }

  const today = toDayKey(new Date());
  const yesterday = shiftDayKey(today, -1);
  let anchor = today;

  if (!uniqueDays.has(today)) {
    if (!uniqueDays.has(yesterday)) return 0;
    anchor = yesterday;
  }

  let streak = 0;
  let cursor = anchor;
  while (uniqueDays.has(cursor)) {
    streak += 1;
    cursor = shiftDayKey(cursor, -1);
  }
  return streak;
}

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function shiftDayKey(dayKey: string, days: number) {
  const date = new Date(`${dayKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toDayKey(date);
}
