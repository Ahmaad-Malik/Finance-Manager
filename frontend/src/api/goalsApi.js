import api from './axios';

export const getGoals = () => api.get('/goals');

// data: { title, targetAmount, deadline, currentAmount? }
export const createGoal = (data) => api.post('/goals', data);

// data: { title?, targetAmount?, deadline? }
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data);

// amount can be negative to withdraw
export const contributeToGoal = (id, amount) =>
  api.patch(`/goals/${id}/contribute`, { amount });

export const deleteGoal = (id) => api.delete(`/goals/${id}`);
