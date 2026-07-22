import api from './axios';

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const updatePassword = (data) => api.put('/auth/password', data);

// 'file' is a File object from an <input type="file"> — sent as multipart/form-data
// under the 'avatar' field, matching upload.single('avatar') on the backend.
export const updateProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return api.put('/auth/profile/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const removeProfilePicture = () => api.delete('/auth/profile/picture');
