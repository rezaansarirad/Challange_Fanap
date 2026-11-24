import { useMemo, useState } from 'react';

const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
const WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

function isLeap(year: number) { const r = ((year - 474) % 2820 + 2820) % 2820 + 474; return ((r + 38) * 682) % 2816 < 682; }
function daysInMonth(year: number, month: number) { return month <= 6 ? 31 : month <= 11 ? 30 : isLeap(year) ? 30 : 29; }
function jalaliToGregorian(jy: number, jm: number, jd: number) {
  let y = jy - 979; let days = 365 * y + Math.floor(y / 33) * 8 + Math.floor(((y % 33) + 3) / 4) + jd - 1;
  for (let m = 1; m < jm; m += 1) days += m <= 6 ? 31 : 30;
  let gy = 1600 + 400 * Math.floor(days / 146097); days %= 146097;
  let leap = true; if (days >= 36525) { days -= 1; gy += 100 * Math.floor(days / 36524); days %= 36524; if (days >= 365) days += 1; else leap = false; }
  gy += 4 * Math.floor(days / 1461); days %= 1461; if (days >= 366) { leap = false; days -= 1; gy += Math.floor(days / 365); days %= 365; }
  const months = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; let gm = 0;
  while (days >= months[gm]) { days -= months[gm]; gm += 1; }
  return { year: gy, month: gm + 1, day: days + 1 };
}
function gregorianToJalali(year: number, month: number, day: number) {
  const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; let gy = year - 1600; const gm = month - 1; const gd = day - 1;
  let days = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400); for (let i = 0; i < gm; i += 1) days += months[i]; if (gm > 1 && year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) days += 1; days += gd - 79;
  const cycle = Math.floor(days / 12053); days %= 12053; let jy = 979 + 33 * cycle + 4 * Math.floor(days / 1461); days %= 1461; if (days >= 366) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  const jm = days < 186 ? Math.floor(days / 31) + 1 : Math.floor((days - 186) / 30) + 7; const jd = days < 186 ? days % 31 + 1 : (days - 186) % 30 + 1; return { year: jy, month: jm, day: jd };
}
function tehranNow() { const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tehran', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date()); const part = (type: string) => Number(parts.find((item) => item.type === type)?.value); return { ...gregorianToJalali(part('year'), part('month'), part('day')), hour: pad(part('hour')), minute: pad(part('minute')) }; }
function pad(value: number) { return String(value).padStart(2, '0'); }

export default function JalaliDatePicker({ onChange }: { onChange: (utcIso: string) => void }) {
  const today = useMemo(tehranNow, []); const [visible, setVisible] = useState(false); const [month, setMonth] = useState({ year: today.year, month: today.month }); const [selected, setSelected] = useState({ year: today.year, month: today.month, day: today.day }); const [hour, setHour] = useState(today.hour); const [minute, setMinute] = useState(today.minute);
  const firstGregorian = jalaliToGregorian(month.year, month.month, 1); const offset = (new Date(Date.UTC(firstGregorian.year, firstGregorian.month - 1, firstGregorian.day)).getUTCDay() + 1) % 7;
  function move(delta: number) { const next = month.month + delta; setMonth(next < 1 ? { year: month.year - 1, month: 12 } : next > 12 ? { year: month.year + 1, month: 1 } : { year: month.year, month: next }); }
  function select(day: number) { const date = { year: month.year, month: month.month, day }; setSelected(date); const g = jalaliToGregorian(date.year, date.month, date.day); const utc = new Date(Date.UTC(g.year, g.month - 1, g.day, Number(hour) - 3, Number(minute) - 30)); onChange(`${utc.getUTCFullYear()}-${pad(utc.getUTCMonth() + 1)}-${pad(utc.getUTCDate())}T${pad(utc.getUTCHours())}:${pad(utc.getUTCMinutes())}:00Z`); setVisible(false); }
  const label = selected ? `${selected.day} ${MONTHS[selected.month - 1]} ${selected.year}` : 'انتخاب تاریخ و ساعت';
  return <div className="jalali-picker"><button type="button" className="calendar-trigger" onClick={() => setVisible((open) => !open)} aria-expanded={visible}><span className="calendar-icon" aria-hidden="true">□</span><span><small>زمان مرجع (اختیاری)</small>{label}</span><b>{hour}:{minute}</b></button>{visible && <div className="calendar-popover" role="dialog" aria-label="تقویم جلالی"><div className="calendar-nav"><button type="button" onClick={() => move(1)} aria-label="ماه بعد">›</button><strong>{MONTHS[month.month - 1]} {month.year}</strong><button type="button" onClick={() => move(-1)} aria-label="ماه قبل">‹</button></div><div className="weekdays">{WEEKDAYS.map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-days">{Array.from({ length: offset }, (_, index) => <i key={`blank-${index}`} />)}{Array.from({ length: daysInMonth(month.year, month.month) }, (_, index) => index + 1).map((day) => <button type="button" key={day} onClick={() => select(day)} className={selected?.year === month.year && selected.month === month.month && selected.day === day ? 'selected' : ''}>{day}</button>)}</div><div className="time-select"><label>ساعت<select value={hour} onChange={(event) => setHour(event.target.value)}>{Array.from({ length: 24 }, (_, value) => <option key={value} value={pad(value)}>{pad(value)}</option>)}</select></label><label>دقیقه<select value={minute} onChange={(event) => setMinute(event.target.value)}>{['00', '15', '30', '45'].map((value) => <option key={value}>{value}</option>)}</select></label></div></div>}</div>;
}
