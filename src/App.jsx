import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './store/AppContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Library from './components/Library';
import AdminDashboard from './components/AdminDashboard';
import SlidePanel from './components/SlidePanel';
import AuthModal from './components/AuthModal';
import ToastContainer from './components/Toast';
import './App.css';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const { state } = useApp();

  const handleViewChange = (view) => {
    if (view === 'admin' && !state.isAdmin) return;
    setCurrentView(view);
  };

  return (
    <div className="app">
      <Header currentView={currentView} onViewChange={handleViewChange} />

      <main className="app__main">
        <div className="app__content">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Dashboard />
              </motion.div>
            )}
            {currentView === 'library' && (
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Library />
              </motion.div>
            )}
            {currentView === 'admin' && state.isAdmin && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <AdminDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="app__footer">
        <div className="app__footer-inner">
          <span className="app__footer-brand mono">PROMPTSHOT</span>
          <span className="app__footer-copy">
            © 2026 PromptShot. Structured Minimal + Industrial Anti-Graffiti.
          </span>
        </div>
      </footer>

      {/* Overlays */}
      <SlidePanel />
      <AuthModal />
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
