import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  loginUser,
  requestRegisterOtp,
  verifyRegisterOtp,
  updateProfile as updateProfileApi,
  updateProfilePicture as updateProfilePictureApi,
  removeProfilePicture as removeProfilePictureApi,
} from '../api/authApi';

const AuthContext = createContext(null);

// Reads a previously stored user/token from localStorage on first load,
// and clears them out if the token has already expired.
const loadStoredAuth = () => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  if (!token || !userJson) return { token: null, user: null };

  try {
    const { exp } = jwtDecode(token);
    if (exp && Date.now() >= exp * 1000) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { token: null, user: null };
    }
    return { token, user: JSON.parse(userJson) };
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { token: null, user: null };
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { token: storedToken, user: storedUser } = loadStoredAuth();
    setToken(storedToken);
    setUser(storedUser);
    setLoading(false);
  }, []);

  const persistSession = ({ token: newToken, ...userData }) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const login = async (email, password) => {
    const { data } = await loginUser({ email, password });
    persistSession(data);
    return data;
  };

  // Step 1: submit the registration form -> backend emails a 6-digit code.
  // Does not create the account or log the user in yet.
  const requestOtp = async (name, email, password) => {
    const { data } = await requestRegisterOtp({ name, email, password });
    return data;
  };

  // Step 2: submit the code -> backend creates the account and returns a session.
  const verifyOtp = async (email, otp) => {
    const { data } = await verifyRegisterOtp({ email, otp });
    persistSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Updates just the display fields (name) after a successful profile edit,
  // without touching the token — the session stays valid.
  const updateProfile = async (name) => {
    const { data } = await updateProfileApi({ name });
    const updatedUser = { ...user, name: data.name };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  // Uploads a new avatar image and stores the returned path on the user.
  const updateProfilePicture = async (file) => {
    const { data } = await updateProfilePictureApi(file);
    const updatedUser = { ...user, profilePicture: data.profilePicture };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  // Clears the avatar image, falling back to the initials avatar.
  const removeProfilePicture = async () => {
    const { data } = await removeProfilePictureApi();
    const updatedUser = { ...user, profilePicture: data.profilePicture };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    requestOtp,
    verifyOtp,
    logout,
    updateProfile,
    updateProfilePicture,
    removeProfilePicture,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
