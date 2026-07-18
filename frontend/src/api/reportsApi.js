import api from './axios';

// params: { month, year }
export const getMonthlyReport = (params) => api.get('/reports/monthly', { params });

// params: { year }
export const getSummaryReport = (params) => api.get('/reports/summary', { params });

// NOTE: the backend does not currently expose PDF/Excel export endpoints
// (only /reports/monthly and /reports/summary, both JSON). Step 9 will need
// either a backend export route added, or a client-side export fallback.
