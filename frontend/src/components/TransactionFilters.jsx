export default function TransactionFilters({ filters, onChange, onReset }) {
  const handleChange = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="filters">
      <div className="form-field">
        <label htmlFor="filter-search">Search</label>
        <input
          id="filter-search"
          name="search"
          type="text"
          placeholder="Description or category..."
          value={filters.search}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label htmlFor="filter-type">Type</label>
        <select id="filter-type" name="type" value={filters.type} onChange={handleChange}>
          <option value="">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="filter-category">Category</label>
        <input
          id="filter-category"
          name="category"
          type="text"
          placeholder="e.g. Food"
          value={filters.category}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label htmlFor="filter-startDate">From</label>
        <input
          id="filter-startDate"
          name="startDate"
          type="date"
          value={filters.startDate}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label htmlFor="filter-endDate">To</label>
        <input
          id="filter-endDate"
          name="endDate"
          type="date"
          value={filters.endDate}
          onChange={handleChange}
        />
      </div>

      <button type="button" className="btn-secondary" onClick={onReset}>
        Clear filters
      </button>
    </div>
  );
}
