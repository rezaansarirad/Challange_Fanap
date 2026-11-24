const TEHRAN = 'Asia/Tehran';
const BUSINESS_DAYS = new Set([0, 1, 2, 5, 6]); // Mon–Wed, Sat–Sun in JS numbering
const HOLIDAYS = new Set([
  '1405-1-1', '1405-1-2', '1405-1-3', '1405-1-4', '1405-1-12', '1405-1-13', '1405-1-25',
  '1405-3-7', '1405-3-14', '1405-3-15', '1405-4-5', '1405-4-6', '1405-5-15', '1405-5-23',
  '1405-5-25', '1405-6-1', '1405-6-10', '1405-8-24', '1405-10-3', '1405-10-17', '1405-11-5',
  '1405-11-22', '1405-12-10', '1405-12-20', '1405-12-21', '1405-12-29',
]);

function jalaliDate(year: number, month: number, day: number): string {
  const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gy = year - 1600; const gm = month - 1; const gd = day - 1;
  let days = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400);
  for (let i = 0; i < gm; i += 1) days += months[i];
  if (gm > 1 && year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) days += 1;
  days += gd - 79;
  const cycle = Math.floor(days / 12053); days %= 12053;
  let jy = 979 + 33 * cycle + 4 * Math.floor(days / 1461); days %= 1461;
  if (days >= 366) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  const jm = days < 186 ? Math.floor(days / 31) + 1 : Math.floor((days - 186) / 30) + 7;
  const jd = days < 186 ? days % 31 + 1 : (days - 186) % 30 + 1;
  return `${jy}-${jm}-${jd}`;
}

function tehranWallTime(timestamp: number): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TEHRAN, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date(timestamp));
  const value = (name: string) => Number(parts.find((part) => part.type === name)?.value);
  return Date.UTC(value('year'), value('month') - 1, value('day'), value('hour'), value('minute'));
}

export function businessMinutesLeft(receivedAt: string, now: number): number {
  const start = tehranWallTime(Date.parse(receivedAt));
  const end = tehranWallTime(now);
  if (end <= start) return 120;
  let total = 0;
  const cursor = new Date(Date.UTC(new Date(start).getUTCFullYear(), new Date(start).getUTCMonth(), new Date(start).getUTCDate()));
  while (cursor.getTime() <= end) {
    const year = cursor.getUTCFullYear(); const month = cursor.getUTCMonth(); const day = cursor.getUTCDate();
    if (BUSINESS_DAYS.has(cursor.getUTCDay()) && !HOLIDAYS.has(jalaliDate(year, month + 1, day))) {
      const open = Date.UTC(year, month, day, 9, 0);
      const close = Date.UTC(year, month, day, 17, 0);
      total += Math.max(0, Math.min(close, end) - Math.max(open, start)) / 60_000;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return Math.round(120 - total);
}

export function formatSla(minutes: number): string {
  const value = Math.abs(minutes); const hours = Math.floor(value / 60); const mins = value % 60;
  const duration = hours ? `${hours} ساعت و ${mins} دقیقه` : `${mins} دقیقه`;
  return minutes <= 0 ? `${duration} از SLA گذشته` : `${duration} تا پایان SLA`;
}
