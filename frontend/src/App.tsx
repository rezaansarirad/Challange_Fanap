import { useEffect, useState } from 'react';
import { analyze } from './api';
import type { AnalyzeResult } from './types';
import UploadForm from './components/UploadForm';
import SummaryTiles from './components/SummaryTiles';
import CategoryBreakdown from './components/CategoryBreakdown';
import AttentionList from './components/AttentionList';
import MessagesTable from './components/MessagesTable';
import { businessMinutesLeft } from './sla';
import DashboardSkeleton from './components/DashboardSkeleton';

export default function App() {
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  async function handleSubmit(file: File, now?: string) {
    setLoading(true);
    setError(null);
    try {
      setResult(await analyze(file, now));
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" dir="rtl">
      <header className="app-header"><div><p className="eyebrow">بازارچه / عملیات پشتیبانی</p><h1>پیگیری پیام‌های مشتریان</h1><p className="muted">فایل CSV پیام‌های پشتیبانی را بارگذاری کنید تا موارد مهم را ببینید.</p><div className="header-tags"><span>تقویم کاری تهران</span><span>تحلیل امن فایل CSV</span></div></div><div className="live-indicator" role="status" aria-atomic="true"><span /> به‌روزرسانی زنده هر دقیقه</div></header>
      <section className="intake-layout" aria-label="بارگذاری و تحلیل پیام‌ها"><div className="intake-form"><UploadForm onSubmit={handleSubmit} loading={loading} /></div><aside className="intake-aside"><p className="eyebrow">مسیر تحلیل</p><h2>از فایل خام تا اولویت‌های قابل اقدام</h2><ol><li><span>۱</span><div><strong>بارگذاری امن</strong><small>فقط فایل CSV خروجی پشتیبانی</small></div></li><li><span>۲</span><div><strong>حذف ارسال‌های تکراری</strong><small>آمار بر اساس پیام‌های یکتا</small></div></li><li><span>۳</span><div><strong>نمایش اولویت پاسخ</strong><small>بر مبنای تقویم کاری تهران</small></div></li></ol></aside></section>
      {error && <p className="error" role="alert">{error}</p>}
      {loading && <DashboardSkeleton />}
      {result && (
        <>
          <SummaryTiles total={result.total_unique_messages} urgent={result.messages.filter((message) => result.attention_message_ids.includes(message.message_id) && businessMinutesLeft(message.received_at, now) <= 0).length} />
          <CategoryBreakdown counts={result.category_counts} total={result.total_unique_messages} />
          <AttentionList ids={result.attention_message_ids} messages={result.messages} now={now} />
          <MessagesTable messages={result.messages} />
        </>
      )}
    </main>
  );
}
