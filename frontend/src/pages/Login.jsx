import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      toast.success('Logged in successfully.');
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.needsVerification) {
        setError('Verification pending. Please check your email for the verification code sent when you registered, or register again to get a new one.');
        return;
      }
      setError(data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page-content">
        <div className="auth-corner-brand">
          <img src="/logo-icon.png" alt="" className="auth-corner-logo" />
          <span>CashFin</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-brand">
            <img src="/logo-icon.png" alt="CashFin" className="auth-form-logo" />
            <h1 className="auth-form-title">CashFin</h1>
            <p className="auth-form-tagline">Track &middot; Plan &middot; Save</p>
          </div>

          <h2 className="auth-form-heading">Log in</h2>

          {error && <div className="form-error">{error}</div>}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log in'}
          </button>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>

      <Footer variant="auth" />
    </div>
  );
}
