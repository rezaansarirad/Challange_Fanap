import { CATEGORIES, type Category } from '../types';
import { formatCategory } from '../format';

interface Props {
  counts: Record<Category, number>;
  total: number;
}

export default function CategoryBreakdown({ counts, total }: Props) {
  return (
    <section className="card">
      <h2>Categories</h2>
      <ul className="breakdown">
        {CATEGORIES.map((cat) => {
          const count = counts[cat] ?? 0;
          const pct = total ? (count / total * 100).toFixed(1) : '0.0';
          return (
            <li key={cat}>
              <span className="cat-name">{formatCategory(cat)}</span>
              <span className="bar">
                <span className="bar-fill" style={{ width: `${pct}%` }} />
              </span>
              <span className="cat-count">{count.toLocaleString('fa-IR')}</span>
              <span className="cat-pct">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
