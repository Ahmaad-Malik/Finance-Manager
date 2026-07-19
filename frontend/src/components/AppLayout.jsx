import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Landmark,
  Target,
  BarChart3,
  Settings as SettingsIcon,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from './Avatar';
import Footer from './Footer';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/budgets', label: 'Budgets', icon: Landmark },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

const railLinkClass = ({ isActive }) => `rail-icon-btn${isActive ? ' active' : ''}`;
const topLinkClass = ({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`;
const tabLinkClass = ({ isActive }) => `mobile-tab${isActive ? ' active' : ''}`;

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
          <span className="header-logo-chip">
            <img src="/logo-icon.png" alt="" className="header-logo" />
          </span>
          <span className="header-name-chip brand-name">CashFin</span>
        </NavLink>

        {/* Desktop only: full text menu lives in the header */}
        <nav className="top-nav" aria-label="Primary">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={topLinkClass}>
              <Icon size={17} strokeWidth={2.1} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="header-user">
          <div className="user-chip">
            <div className="user-meta">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
            <Avatar name={user?.name} src={user?.profilePicture} className="user-avatar" />
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

      {/* Mobile/tablet only: horizontal toggle bar, the active item is highlighted */}
      <nav className="mobile-tab-bar" aria-label="Primary">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={tabLinkClass}>
            <Icon size={17} strokeWidth={2.1} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="app-body">
        {/* Desktop only: slim rail with just settings + theme */}
        <aside className="side-rail">
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

          <Footer />
        </main>
      </div>

      {/* Mobile/tablet only: floating settings + theme buttons, bottom-left */}
      <div className="mobile-fab-stack">
        <NavLink to="/settings" className={railLinkClass} title="Settings" aria-label="Settings">
          <SettingsIcon size={20} strokeWidth={2} />
        </NavLink>
        <button
          type="button"
          className="rail-icon-btn"
          onClick={toggleTheme}
          title={themeLabel}
          aria-label={themeLabel}
        >
          {theme === 'dark' ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
        </button>
      </div>
    </div>
  );
}
