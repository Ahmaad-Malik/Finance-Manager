// tone thresholds (budgets, default): <75% ok (green), 75-99% warn (amber), >=100% danger (red)
// positive mode (savings goals): always green — more progress is always good, there's no "overspending" equivalent
export default function ProgressBar({ percent, positive = false }) {
  const clamped = Math.max(0, Math.min(100, percent));
  let tone = 'ok';
  if (!positive) {
    if (percent >= 100) tone = 'danger';
    else if (percent >= 75) tone = 'warn';
  }

  return (
    <div className="progress-bar">
      <div className={`progress-bar-fill progress-bar-fill--${tone}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}
