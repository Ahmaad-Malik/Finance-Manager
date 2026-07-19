import { NavLink } from 'react-router-dom';
import { Mail, Link2 } from 'lucide-react';

const FOOTER_LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transactions', label: 'Transactions' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/goals', label: 'Goals' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
];

// variant 'app' (default) shows the in-app page links; variant 'auth' is used
// on the login/register screens, where those routes aren't reachable yet.
export default function Footer({ variant = 'app' }) {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/logo-icon.png" alt="" className="footer-logo" />
          <div>
            <span className="footer-brand-name">CashFin</span>
            <p className="footer-tagline">Track &middot; Plan &middot; Save</p>
          </div>
        </div>

        {variant === 'app' && (
          <nav className="footer-links" aria-label="Footer">
            {FOOTER_LINKS.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}>
                {label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="footer-contact">
          <p className="footer-developer">Developed by M.Ahmad</p>
          <a href="mailto:ahmaadmalik01@gmail.com" className="footer-contact-link">
            <Mail size={14} strokeWidth={2} />
            <span>ahmaadmalik01@gmail.com</span>
          </a>
          <a
            href="https://linkedin.com/in/m-ahmaad"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-contact-link"
          >
            <Link2 size={14} strokeWidth={2} />
            <span>linkedin.com/in/m-ahmaad</span>
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {year} CashFin. All rights reserved.</p>
      </div>
    </footer>
  );
}
