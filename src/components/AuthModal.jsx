import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../store/AppContext';
import './AuthModal.css';

export default function AuthModal() {
  const { state, dispatch, login, signup, addToast } = useApp();
  const { isAuthModalOpen, authMode } = state;

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      const success = login(form.username, form.password);
      if (!success) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다');
        return;
      }
      addToast('로그인 되었습니다', 'success');
    } else {
      if (!form.username || !form.email || !form.password) {
        setError('모든 필드를 입력해주세요');
        return;
      }
      const success = signup(form.username, form.email, form.password);
      if (!success) {
        setError('이미 사용 중인 아이디 또는 이메일입니다');
        return;
      }
      addToast('회원가입이 완료되었습니다', 'success');
    }
    setForm({ username: '', email: '', password: '' });
    setError('');
  };

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_AUTH_MODAL' });
    setForm({ username: '', email: '', password: '' });
    setError('');
  };

  const toggleMode = () => {
    dispatch({ type: 'SET_AUTH_MODE', payload: authMode === 'login' ? 'signup' : 'login' });
    setError('');
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <>
          <motion.div
            className="auth-modal__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="auth-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Header */}
            <div className="auth-modal__header">
              <div className="auth-modal__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h2 className="auth-modal__title">
                {authMode === 'login' ? '로그인' : '회원가입'}
              </h2>
              <p className="auth-modal__subtitle">
                {authMode === 'login'
                  ? 'PromptShot에 로그인하세요'
                  : '새 계정을 만드세요'
                }
              </p>
            </div>

            {/* Form */}
            <form className="auth-modal__form" onSubmit={handleSubmit}>
              <div className="auth-modal__field">
                <label className="auth-modal__label mono" htmlFor="auth-username">
                  {authMode === 'login' ? 'ID / EMAIL' : 'USERNAME'}
                </label>
                <input
                  id="auth-username"
                  type="text"
                  className="auth-modal__input"
                  value={form.username}
                  onChange={handleChange('username')}
                  placeholder={authMode === 'login' ? 'admin' : 'your_name'}
                  autoFocus
                  autoComplete="username"
                />
              </div>

              {authMode === 'signup' && (
                <motion.div
                  className="auth-modal__field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="auth-modal__label mono" htmlFor="auth-email">EMAIL</label>
                  <input
                    id="auth-email"
                    type="email"
                    className="auth-modal__input"
                    value={form.email}
                    onChange={handleChange('email')}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </motion.div>
              )}

              <div className="auth-modal__field">
                <label className="auth-modal__label mono" htmlFor="auth-password">PASSWORD</label>
                <input
                  id="auth-password"
                  type="password"
                  className="auth-modal__input"
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="••••••"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <motion.p
                  className="auth-modal__error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}

              <button type="submit" className="auth-modal__submit">
                {authMode === 'login' ? '로그인' : '가입하기'}
              </button>
            </form>

            {/* Toggle */}
            <div className="auth-modal__footer">
              <span className="auth-modal__footer-text">
                {authMode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              </span>
              <button className="auth-modal__toggle" onClick={toggleMode}>
                {authMode === 'login' ? '회원가입' : '로그인'}
              </button>
            </div>

            {/* Close */}
            <button className="auth-modal__close" onClick={handleClose} aria-label="닫기">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
