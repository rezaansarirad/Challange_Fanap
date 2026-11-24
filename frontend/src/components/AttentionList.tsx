import { useMemo, useState } from 'react';
import type { Message } from '../types';
import { requestDraft } from '../api';
import { businessMinutesLeft, formatSla } from '../sla';

interface Props {
  ids: string[];
  messages: Message[];
  now: number;
}

export default function AttentionList({ ids, messages, now }: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const rows = useMemo(() => {
    const byId = new Map(messages.map((message) => [message.message_id, message]));
    return ids.map((id) => byId.get(id)).filter((message): message is Message => Boolean(message))
      .map((message) => ({ message, left: businessMinutesLeft(message.received_at, now) }))
      .sort((a, b) => a.left - b.left);
  }, [ids, messages, now]);

  async function onDraft(m: Message) {
    setBusy(m.message_id);
    setWarnings((prev) => ({ ...prev, [m.message_id]: '' }));
    try {
      const d = await requestDraft({
        message_id: m.message_id,
        customer_id: m.customer_id,
        subject: m.subject,
        body: m.body,
      });
      if (d.blocked) setWarnings((prev) => ({ ...prev, [m.message_id]: d.warnings.join(' ') || 'تولید پیش‌نویس امن نبود.' }));
      else setDrafts((prev) => ({ ...prev, [m.message_id]: d.draft }));
    } catch {
      setWarnings((prev) => ({ ...prev, [m.message_id]: 'ارتباط با سرویس پیش‌نویس برقرار نشد.' }));
    } finally {
      setBusy(null);
    }
  }

  async function approve(id: string) {
    try {
      await navigator.clipboard.writeText(drafts[id]);
      setWarnings((prev) => ({ ...prev, [id]: 'متن نهایی در کلیپ‌بورد کپی شد.' }));
    } catch {
      setWarnings((prev) => ({ ...prev, [id]: 'کپی خودکار ممکن نشد؛ متن را دستی کپی کنید.' }));
    }
  }

  return (
    <section className="card attention-card" aria-labelledby="attention-title">
      <div className="section-heading"><div><p className="eyebrow">اولویت پاسخ</p><h2 id="attention-title">نیازمند توجه <span>{rows.length}</span></h2></div><p className="muted">زمان‌ها بر اساس ساعت کاری تهران محاسبه می‌شوند.</p></div>
      {rows.length === 0 ? (
        <p className="empty">پیام پرشدتِ بدون پاسخ ندارید.</p>
      ) : (
        <ul className="attention-list">
          {rows.map(({ message: m, left }) => {
            return (
              <li
                key={m.message_id}
                className={left <= 0 ? 'attention-row overdue' : 'attention-row'}
                data-testid="attention-row"
                data-message-id={m.message_id}
                data-business-minutes-left={left}
              >
                <div className="attention-main"><div className="attention-title"><strong dir="auto">{m.subject || 'بدون موضوع'}</strong><span className={left <= 0 ? 'status urgent' : 'status pending'}>{left <= 0 ? 'فوری' : 'در آستانه'}</span></div><p className="attention-meta"><span>{m.channel}</span><span>{formatSla(left)}</span><code>{m.message_id}</code></p><p className="message-preview" dir="auto">{m.body}</p></div>
                <div className="draft-actions"><button type="button" className="secondary-button" data-testid="draft-button" disabled={busy === m.message_id} onClick={() => onDraft(m)}>{busy === m.message_id ? 'در حال نگارش…' : 'پیش‌نویس پاسخ'}</button></div>
                {warnings[m.message_id] && <p className="draft-warning" data-testid="draft-warning" role="status">{warnings[m.message_id]}</p>}
                {drafts[m.message_id] !== undefined && (
                  <div className="draft-editor"><label htmlFor={`draft-${m.message_id}`}>پیش‌نویس قابل ویرایش</label><textarea id={`draft-${m.message_id}`} data-testid="draft-text" dir="auto" value={drafts[m.message_id]} onChange={(event) => setDrafts((prev) => ({ ...prev, [m.message_id]: event.target.value }))} /><button type="button" data-testid="draft-approve" onClick={() => approve(m.message_id)}>تأیید و کپی متن</button></div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
