import { MONTH_NAMES } from '../utils/format';

export default function MonthYearSelector({ month, year, onChange }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 3 + i);

  return (
    <div className="month-year-selector">
      <div className="form-field">
        <label htmlFor="month-select">Month</label>
        <select
          id="month-select"
          value={month}
          onChange={(e) => onChange({ month: Number(e.target.value), year })}
        >
          {MONTH_NAMES.map((name, idx) => (
            <option key={name} value={idx + 1}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="year-select">Year</label>
        <select
          id="year-select"
          value={year}
          onChange={(e) => onChange({ month, year: Number(e.target.value) })}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
