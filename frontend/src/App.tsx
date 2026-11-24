import { useEffect, useState } from 'react';
import { analyze } from './api';
import type { AnalyzeResult } from './types';
import UploadForm from './components/UploadForm';
import SummaryTiles from './components/SummaryTiles';
import CategoryBreakdown from './components/CategoryBreakdown';
import AttentionList from './components/AttentionList';
import MessagesTable from './components/MessagesTable';
import { businessMinutesLeft } from './sla';

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
      <header className="app-header"><div><p className="eyebrow">بازارچه / عملیات پشتیبانی</p><h1>رادار پیام‌های مشتریان</h1><p className="muted">صادرات روزانه را بارگذاری کنید تا موارد مهم را با اطمینان پیگیری کنید.</p></div><div className="live-indicator" role="status" aria-atomic="true"><span /> به‌روزرسانی زنده هر دقیقه</div></header>
      <UploadForm onSubmit={handleSubmit} loading={loading} />
      {error && <p className="error" role="alert">{error}</p>}
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
