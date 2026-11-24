"""Business-hours arithmetic for the support SLA."""
from __future__ import annotations

from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

BUSINESS_START = time(9, 0)
BUSINESS_END = time(17, 0)
TEHRAN = ZoneInfo("Asia/Tehran")
# Python weekdays: Saturday=5, Sunday=6, Monday=0, Tuesday=1, Wednesday=2.
BUSINESS_WEEKDAYS = frozenset({5, 6, 0, 1, 2})

# Public holidays supplied with the exercise. Kept in Jalali form because that
# is how Bazarcheh's operations calendar is maintained.
PUBLIC_HOLIDAYS = frozenset({
    (1405, 1, 1), (1405, 1, 2), (1405, 1, 3), (1405, 1, 4), (1405, 1, 12),
    (1405, 1, 13), (1405, 1, 25), (1405, 3, 7), (1405, 3, 14), (1405, 3, 15),
    (1405, 4, 5), (1405, 4, 6), (1405, 5, 15), (1405, 5, 23), (1405, 5, 25),
    (1405, 6, 1), (1405, 6, 10), (1405, 8, 24), (1405, 10, 3), (1405, 10, 17),
    (1405, 11, 5), (1405, 11, 22), (1405, 12, 10), (1405, 12, 20),
    (1405, 12, 21), (1405, 12, 29),
})


def gregorian_to_jalali(year: int, month: int, day: int) -> tuple[int, int, int]:
    """Convert a Gregorian date to Jalali without a third-party dependency."""
    days_in_month = (31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31)
    gy, gm, gd = year - 1600, month - 1, day - 1
    day_no = 365 * gy + (gy + 3) // 4 - (gy + 99) // 100 + (gy + 399) // 400
    day_no += sum(days_in_month[:gm])
    if gm > 1 and (year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)):
        day_no += 1
    day_no += gd

    j_day_no = day_no - 79
    j_np, j_day_no = divmod(j_day_no, 12053)
    jy = 979 + 33 * j_np + 4 * (j_day_no // 1461)
    j_day_no %= 1461
    if j_day_no >= 366:
        jy += (j_day_no - 1) // 365
        j_day_no = (j_day_no - 1) % 365
    if j_day_no < 186:
        jm, jd = j_day_no // 31 + 1, j_day_no % 31 + 1
    else:
        jm, jd = (j_day_no - 186) // 30 + 7, (j_day_no - 186) % 30 + 1
    return jy, jm, jd


def is_business_day(day: datetime) -> bool:
    jalali = gregorian_to_jalali(day.year, day.month, day.day)
    return day.weekday() in BUSINESS_WEEKDAYS and jalali not in PUBLIC_HOLIDAYS


def business_hours_between(start: datetime, end: datetime) -> float:
    """Number of business hours in the half-open interval ``[start, end)``."""
    if end <= start:
        return 0.0

    start = start.astimezone(TEHRAN)
    end = end.astimezone(TEHRAN)

    total = timedelta(0)
    day = datetime.combine(start.date(), time(0, 0), tzinfo=TEHRAN)
    while day <= end:
        if is_business_day(day):
            opens = datetime.combine(day.date(), BUSINESS_START, tzinfo=TEHRAN)
            closes = datetime.combine(day.date(), BUSINESS_END, tzinfo=TEHRAN)
            lo = max(opens, start)
            hi = min(closes, end)
            if hi > lo:
                total += hi - lo
        day += timedelta(days=1)

    return total.total_seconds() / 3600.0
