import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const RESEND_COOLDOWN_SECONDS = 30;

export default function Register() {
  const { requestOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  // 'details' = the name/email/password form, 'otp' = the code-entry step
  const [step, setStep] = useState('details');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Step 1: validate the form and ask the backend to email a code
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await requestOtp(form.name, form.email, form.password);
      toast.success(`We sent a code to ${form.email}`);
      setStep('otp');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send verification code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: submit the code -> account gets created and the user is logged in
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }

    setSubmitting(true);
    try {
      await verifyOtp(form.email, otp);
      toast.success('Account created! Welcome aboard.');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError('');
    setSubmitting(true);
    try {
      await requestOtp(form.name, form.email, form.password);
      toast.success('A new code has been sent.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="auth-page">
        <div className="auth-page-content">
          <div className="auth-corner-brand">
            <img src="/logo-icon.png" alt="" className="auth-corner-logo" />
            <span>CashFin</span>
          </div>

          <form className="auth-form" onSubmit={handleOtpSubmit}>
            <div className="auth-form-brand">
              <img src="/logo-icon.png" alt="CashFin" className="auth-form-logo" />
              <h1 className="auth-form-title">CashFin</h1>
              <p className="auth-form-tagline">Track &middot; Plan &middot; Save</p>
            </div>

            <h2 className="auth-form-heading">Verify your email</h2>
            <p style={{ marginTop: '-8px', marginBottom: '16px', fontSize: '0.9rem' }}>
              Enter the 6-digit code we sent to <strong>{form.email}</strong>.
            </p>

            {error && <div className="form-error">{error}</div>}

            <label htmlFor="otp">Verification code</label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              style={{ letterSpacing: '6px', fontSize: '1.2rem', textAlign: 'center' }}
              required
            />

            <button type="submit" disabled={submitting}>
              {submitting ? 'Verifying...' : 'Verify & create account'}
            </button>

            <p className="auth-switch">
              Didn't get it?{' '}
              {cooldown > 0 ? (
                <span>Resend in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={submitting}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Resend code
                </button>
              )}
            </p>

            <p className="auth-switch">
              <button
                type="button"
                onClick={() => { setStep('details'); setError(''); setOtp(''); }}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Use a different email
              </button>
            </p>
          </form>
        </div>

        <Footer variant="auth" />
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-page-content">
        <div className="auth-corner-brand">
          <img src="/logo-icon.png" alt="" className="auth-corner-logo" />
          <span>CashFin</span>
        </div>

        <form className="auth-form" onSubmit={handleDetailsSubmit}>
          <div className="auth-form-brand">
            <img src="/logo-icon.png" alt="CashFin" className="auth-form-logo" />
            <h1 className="auth-form-title">CashFin</h1>
            <p className="auth-form-tagline">Track &middot; Plan &middot; Save</p>
          </div>

          <h2 className="auth-form-heading">Create an account</h2>

          {error && <div className="form-error">{error}</div>}

          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            required
          />

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
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
          />

          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            minLength={6}
            required
          />

          <button type="submit" disabled={submitting}>
            {submitting ? 'Sending code...' : 'Continue'}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>

      <Footer variant="auth" />
    </div>
  );
}
