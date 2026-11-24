export default function DashboardSkeleton() {
  return <div className="skeleton-dashboard" aria-busy="true" aria-label="در حال آماده‌سازی تحلیل">
    <div className="skeleton-row"><i /><i /></div>
    <section className="card skeleton-card"><b /><b /><b /><b /><b /></section>
    <section className="card skeleton-card skeleton-list"><b /><b /><b /></section>
  </div>;
}
