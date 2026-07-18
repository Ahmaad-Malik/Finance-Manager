import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Target,
  BarChart3,
  Settings as SettingsIcon,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

const railLinkClass = ({ isActive }) => `rail-icon-btn${isActive ? ' active' : ''}`;
const topLinkClass = ({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`;

const getInitials = (name) =>
  (name || '?')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const themeLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/" className="header-brand" aria-label="CashFin home">
          <img src="/logo-icon.png" alt="" className="header-logo" />
          <span className="brand-name">CashFin</span>
        </NavLink>

        <nav className="top-nav" aria-label="Primary">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={topLinkClass}>
              <Icon size={17} strokeWidth={2.1} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="header-user">
          <div className="user-meta">
            <span className="user-name">{user?.name}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <div className="user-avatar" aria-hidden="true">
            {getInitials(user?.name)}
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={18} strokeWidth={2} />
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="side-rail">
          <nav className="side-rail-nav" aria-label="Primary">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={railLinkClass} title={label}>
                <Icon size={20} strokeWidth={2} />
                <span className="rail-label">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="side-rail-bottom">
            <NavLink to="/settings" className={railLinkClass} title="Settings">
              <SettingsIcon size={20} strokeWidth={2} />
              <span className="rail-label">Settings</span>
            </NavLink>
            <button
              type="button"
              className="rail-icon-btn"
              onClick={toggleTheme}
              title={themeLabel}
              aria-label={themeLabel}
            >
              {theme === 'dark' ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
              <span className="rail-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
