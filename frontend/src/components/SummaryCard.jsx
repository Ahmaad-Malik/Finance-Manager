export default function SummaryCard({ label, value, tone = 'neutral', sub }) {
  return (
    <div className={`summary-card summary-card--${tone}`}>
      <div className="summary-card-label">{label}</div>
      <div className="summary-card-value">{value}</div>
      {sub && <div className="summary-card-sub">{sub}</div>}
    </div>
  );
}
