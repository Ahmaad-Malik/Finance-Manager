import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const TONE_ICON = {
  positive: TrendingUp,
  negative: TrendingDown,
  neutral: Wallet,
};

export default function SummaryCard({ label, value, tone = 'neutral', sub }) {
  const Icon = TONE_ICON[tone] || Wallet;

  return (
    <div className={`summary-card summary-card--${tone}`}>
      <div className="summary-card-top">
        <div className="summary-card-label">{label}</div>
        <div className={`summary-card-icon summary-card-icon--${tone}`}>
          <Icon size={16} strokeWidth={2.25} />
        </div>
      </div>
      <div className="summary-card-value">{value}</div>
      {sub && <div className="summary-card-sub">{sub}</div>}
    </div>
  );
}
