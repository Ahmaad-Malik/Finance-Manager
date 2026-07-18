// tone thresholds: <75% ok (green), 75-99% warn (amber), >=100% danger (red)
export default function ProgressBar({ percent }) {
  const clamped = Math.max(0, Math.min(100, percent));
  let tone = 'ok';
  if (percent >= 100) tone = 'danger';
  else if (percent >= 75) tone = 'warn';

  return (
    <div className="progress-bar">
      <div className={`progress-bar-fill progress-bar-fill--${tone}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}
