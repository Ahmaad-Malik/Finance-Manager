import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const OTP_SECONDS = 60;

export default function VerifyOtp() {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Email is passed via router state from Register/Login. If someone lands
  // here directly (e.g. page refresh) without it, bounce them back.
  const email = location.state?.email;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_SECONDS);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const restartTimer = () => {
    clearInterval(intervalRef.current);
    setSecondsLeft(OTP_SECONDS);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Enter the 6-digit code sent to your email.');
      return;
    }

    setSubmitting(true);
    try {
      await verifyOtp(email, otp);
      toast.success('Email verified! Welcome aboard.');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResending(true);
    try {
      await resendOtp(email);
      toast.success('A new code has been sent to your email.');
      setOtp('');
      restartTimer();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

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

          <h2 className="auth-form-heading">Verify your email</h2>
          <p style={{ marginTop: '-0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
            We sent a 6-digit code to <strong>{email}</strong>. It expires in 1 minute.
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
            placeholder="123456"
            required
          />

          <button type="submit" disabled={submitting || otp.length !== 6}>
            {submitting ? 'Verifying...' : 'Verify'}
          </button>

          <p className="auth-switch">
            {secondsLeft > 0 ? (
              <>Code expires in {secondsLeft}s</>
            ) : (
              <>Code expired.</>
            )}{' '}
            {secondsLeft === 0 && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
              >
                {resending ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </p>

          <p className="auth-switch">
            <Link to="/register">Back to register</Link>
          </p>
        </form>
      </div>

      <Footer variant="auth" />
    </div>
  );
}
