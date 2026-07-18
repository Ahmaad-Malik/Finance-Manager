// The API base is like http://localhost:5000/api — uploaded files are served
// from the same host but without the /api prefix (see Server.js: app.use('/uploads', ...)).
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const apiOrigin = apiBase.replace(/\/api\/?$/, '');

export const getUploadUrl = (path) => {
  if (!path) return null;
  return `${apiOrigin}${path}`;
};
