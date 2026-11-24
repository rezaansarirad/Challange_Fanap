from __future__ import annotations

from datetime import datetime, timezone

from app.sla import business_hours_between


def _utc(*args: int) -> datetime:
    return datetime(*args, tzinfo=timezone.utc)


def test_business_hours_within_one_tehran_business_day() -> None:
    # Monday 2026-10-26, 10:00 -> 13:30 Tehran (+03:30)
    assert business_hours_between(_utc(2026, 10, 26, 6, 30), _utc(2026, 10, 26, 10, 0)) == 3.5


def test_business_hours_skip_thursday_and_friday() -> None:
    # Wednesday 16:00 -> Saturday 10:00 Tehran: one hour each working day.
    start = _utc(2026, 10, 21, 12, 30)
    end = _utc(2026, 10, 24, 6, 30)
    assert business_hours_between(start, end) == 2.0


def test_business_hours_skip_supplied_jalali_holiday() -> None:
    # 1405/01/04 is a supplied holiday (2026-03-24).
    assert business_hours_between(_utc(2026, 3, 24, 5, 30), _utc(2026, 3, 24, 13, 30)) == 0.0


def test_business_hours_empty_interval() -> None:
    t = _utc(2026, 10, 26, 10, 0)
    assert business_hours_between(t, t) == 0.0
