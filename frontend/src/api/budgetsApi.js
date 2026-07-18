import api from './axios';

// params: { month, year } — required by backend
export const getBudgets = (params) => api.get('/budgets', { params });

// data: { category, monthlyLimit, month, year } — upserts on the backend
export const createBudget = (data) => api.post('/budgets', data);

export const deleteBudget = (id) => api.delete(`/budgets/${id}`);
