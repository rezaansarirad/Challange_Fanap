"""Order reference extraction."""
from __future__ import annotations

import re

ORDER_REF_PATTERN = re.compile(r"BZ-([0-9]+)", re.IGNORECASE)
PERSIAN_DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")


def find_order_ref(text: str | None) -> str | None:
    """Return the first ``BZ-<digits>`` reference in ``text`` (upper-cased prefix)."""
    if not text:
        return None
    match = ORDER_REF_PATTERN.search(text.translate(PERSIAN_DIGITS))
    if match is None:
        return None
    return f"BZ-{match.group(1)}"


def extract_order_ref(order_ref: str | None, body: str | None) -> str | None:
    """Prefer the explicit ``order_ref`` field; fall back to scanning the body."""
    return find_order_ref(order_ref) or find_order_ref(body)
