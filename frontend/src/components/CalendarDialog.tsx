import { useEffect, useRef, useState } from 'react';

const months = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const formatter = new Intl.DateTimeFormat('en-US-u-ca-persian', { timeZone: 'Asia/Tehran', year: 'numeric', month: 'numeric', day: 'numeric' });
function parts(date: Date) { const p = formatter.formatToParts(date); const get = (name: string) => Number(p.find(x => x.type === name)?.value); return { year: get('year'), month: get('month'), day: get('day') }; }
function gregorian(year: number, month: number, day: number) {
  const start = Date.UTC(year + 621, 2, 18, 12);
  for (let i = 0; i < 370; i++) { const date = new Date(start + i * 86400000); const p = parts(date); if (p.year === year && p.month === month && p.day === day) return date; }
  throw new Error('تاریخ نامعتبر');
}
export default function CalendarDialog({ onChange }: { onChange: (value: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [date, setDate] = useState(() => parts(new Date()));
  const [view, setView] = useState(date);
  const [monthList, setMonthList] = useState(false);
  const [time, setTime] = useState(() => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()).split(':').map(Number));
  const first = gregorian(view.year, view.month, 1);
  const offset = (first.getUTCDay() + 1) % 7;
  const count = view.month < 7 ? 31 : view.month < 12 ? 30 : parts(new Date(gregorian(view.year + 1, 1, 1).getTime() - 86400000)).day;
  useEffect(() => { const element = dialog.current; if (!element) return; const close = (event: MouseEvent) => { if (event.target === element) element.close(); }; element.addEventListener('click', close); return () => element.removeEventListener('click', close); }, []);
  function move(delta: number) { const m = view.month + delta; setView({ ...view, month: m < 1 ? 12 : m > 12 ? 1 : m, year: view.year + (m < 1 ? -1 : m > 12 ? 1 : 0) }); }
  function confirm() { const g = gregorian(date.year, date.month, date.day); onChange(new Date(Date.UTC(g.getUTCFullYear(), g.getUTCMonth(), g.getUTCDate(), time[0], time[1]) - 210 * 60000).toISOString()); dialog.current?.close(); }
  return <><button type="button" className="calendar-trigger" onClick={() => { setView(date); setMonthList(false); dialog.current?.showModal(); }}><span aria-hidden="true">▦</span><span><small>تاریخ و ساعت مرجع · تهران</small>{date.day} {months[date.month - 1]} {date.year}</span><b dir="ltr">{String(time[0]).padStart(2,'0')}:{String(time[1]).padStart(2,'0')}</b></button>
    <dialog ref={dialog} className="date-dialog" aria-labelledby="calendar-heading"><div className="dialog-content"><div className="dialog-title"><h2 id="calendar-heading">انتخاب تاریخ و ساعت</h2><button type="button" aria-label="بستن تقویم" onClick={() => dialog.current?.close()}>×</button></div><div className="calendar-nav"><button type="button" aria-label="ماه قبل" onClick={() => move(-1)}>›</button><button type="button" className="month-title" onClick={() => setMonthList(!monthList)}>{months[view.month - 1]} {view.year} ⌄</button><button type="button" aria-label="ماه بعد" onClick={() => move(1)}>‹</button></div>
    {monthList ? <div className="month-grid">{months.map((name, i) => <button type="button" key={name} aria-pressed={view.month === i + 1} onClick={() => { setView({ ...view, month: i + 1 }); setMonthList(false); }}>{name}</button>)}</div> : <><div className="weekdays">{['ش','ی','د','س','چ','پ','ج'].map(x => <span key={x}>{x}</span>)}</div><div className="calendar-days">{Array.from({length:offset}, (_,i) => <i key={`b${i}`}/>)}{Array.from({length:count},(_,i) => i+1).map(day => <button type="button" key={day} aria-pressed={date.year === view.year && date.month === view.month && date.day === day} className={date.year === view.year && date.month === view.month && date.day === day ? 'selected' : ''} onClick={() => setDate({...view,day})}>{day}</button>)}</div></>}
    <div className="time-steppers">{['ساعت','دقیقه'].map((label,i) => <div key={label}><label>{label}</label><div><button type="button" aria-label={`افزایش ${label}`} onClick={() => setTime(time.map((n,j) => j === i ? (n + 1) % (i ? 60 : 24) : n))}>+</button><output>{String(time[i]).padStart(2,'0')}</output><button type="button" aria-label={`کاهش ${label}`} onClick={() => setTime(time.map((n,j) => j === i ? (n + (i ? 59 : 23)) % (i ? 60 : 24) : n))}>−</button></div></div>)}</div><button type="button" className="confirm-date" onClick={confirm}>تأیید تاریخ و ساعت</button></div></dialog></>;
}
