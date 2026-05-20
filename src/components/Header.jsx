import { motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import './Header.css';

export default function Header({ currentView, onViewChange }) {
  const { state, dispatch } = useApp();
  const { currentUser, isAdmin } = state;

  const navItems = [
    { id: 'dashboard', label: '대시보드' },
    { id: 'library', label: '라이브러리' },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'SYSTEM' });
  }

  return (
    <motion.header
      className="header"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="header__inner">
        {/* Logo */}
        <div className="header__logo-group">
          <span className="header__logo glitch-text">
            PROMPT<span className="accent">SHOT</span>
          </span>
          <span className="header__version mono">v2.0</span>
        </div>

        {/* Nav Links */}
        <nav className="header__nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`header__nav-link ${currentView === item.id ? 'is-active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              {item.label}
              {currentView === item.id && (
                <motion.div
                  className="header__nav-indicator"
                  layoutId="nav-indicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Right section */}
        <div className="header__actions">
          {currentUser ? (
            <div className="header__user-group">
              <div className="header__user-badge">
                <span className="header__user-avatar">
                  {currentUser.username.charAt(0).toUpperCase()}
                </span>
                <span className="header__user-name mono">{currentUser.username}</span>
              </div>
              <button
                className="header__btn header__btn--ghost"
                onClick={() => dispatch({ type: 'LOGOUT' })}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              className="header__btn header__btn--accent"
              onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: 'login' })}
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
