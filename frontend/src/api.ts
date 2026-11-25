import type { AnalyzeResult, Draft } from './types';

export async function analyze(file: File, now?: string): Promise<AnalyzeResult> {
  const form = new FormData();
  form.append('file', file);
  const qs = now ? `?now=${encodeURIComponent(now)}` : '';
  const res = await fetch(`/api/analyze${qs}`, { method: 'POST', body: form });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const detail = String(error.detail || '');
    if (detail.includes('missing columns')) throw new Error('این فایل خروجی پیش‌بینی است یا ساختار پیام‌ها را ندارد. فایل messages_sample.csv یا eval_messages.csv را بارگذاری کنید. ستون‌های لازم: customer_id، channel، received_at، answered_at، subject، body، order_ref و severity_hint.');
    throw new Error(detail || `تحلیل فایل ناموفق بود (${res.status}).`);
  }
  return res.json();
}

export async function requestDraft(m: {
  message_id: string;
  customer_id: string;
  subject: string;
  body: string;
}): Promise<Draft> {
  const res = await fetch('/api/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(m),
  });
  if (!res.ok) {
    throw new Error(`Draft failed (${res.status})`);
  }
  return res.json();
}
