import type { Message } from '../types';
import { formatCategory, formatDate } from '../format';

const MAX_ROWS = 200;

function OrderAwareText({ text }: { text: string }) {
  const parts = text.split(/(BZ-[0-9]+)/gi);
  return <>{parts.map((part, index) => /^BZ-[0-9]+$/i.test(part) ? <mark className="order-ref" key={`${part}-${index}`}>{part}</mark> : part)}</>;
}

export default function MessagesTable({ messages }: { messages: Message[] }) {
  const rows = messages.slice(0, MAX_ROWS);
  return (
    <section className="card">
      <h2>همه پیام‌ها</h2>
      {messages.length > MAX_ROWS && (
        <p className="muted">نمایش {MAX_ROWS} پیام از {messages.length.toLocaleString('fa-IR')} پیام.</p>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>شناسه</th><th>دسته‌بندی</th><th>فوری</th><th>سفارش</th><th>کانال</th><th>دریافت</th><th>موضوع</th><th>پیام</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.message_id}>
                <td>{m.message_id}</td>
                <td>{formatCategory(m.category)}</td>
                <td>{m.is_urgent ? 'بله' : '—'}</td>
                <td>{m.order_ref ?? '-'}</td>
                <td>{m.channel}</td>
                <td>{formatDate(m.received_at)}</td>
                <td dir="auto">{m.subject}</td>
                <td dir="auto" className="body-cell"><OrderAwareText text={m.body} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
