import api from './axios';

// filters: { type, category, startDate, endDate, page, limit }
export const getTransactions = (params = {}) =>
  api.get('/transactions', { params });

// formData must be a FormData instance when a receipt image is attached
// (multipart/form-data), otherwise a plain object is fine.
export const createTransaction = (data) => {
  const isFormData = data instanceof FormData;
  return api.post('/transactions', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
};

export const updateTransaction = (id, data) => {
  const isFormData = data instanceof FormData;
  return api.put(`/transactions/${id}`, data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
};

export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);
