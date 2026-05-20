import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { state, dispatch, addToast } = useApp();
  const { users, prompts, publicSyncEnabled } = state;
  const [terminalLines, setTerminalLines] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const terminalRef = useRef(null);

  useEffect(() => {
    // Boot sequence
    const bootLines = [
      { text: '> PROMPTSHOT SYSTEM DASHBOARD v2.0', type: 'system' },
      { text: '> Initializing admin session...', type: 'system' },
      { text: `> Connected. ${users.length} users online. ${prompts.length} prompts indexed.`, type: 'success' },
      { text: `> Public sync: ${publicSyncEnabled ? 'ENABLED' : 'DISABLED'}`, type: publicSyncEnabled ? 'success' : 'warning' },
      { text: '> Type "help" for available commands.', type: 'info' },
      { text: '───────────────────────────────────────', type: 'divider' },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < bootLines.length) {
        setTerminalLines(prev => [...prev, bootLines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const handleCommand = (e) => {
    e.preventDefault();
    const cmd = inputValue.trim().toLowerCase();
    if (!cmd) return;

    setTerminalLines(prev => [...prev, { text: `$ ${cmd}`, type: 'command' }]);
    setInputValue('');

    switch (cmd) {
      case 'help':
        setTerminalLines(prev => [...prev,
          { text: 'Available commands:', type: 'info' },
          { text: '  status     — System status overview', type: 'info' },
          { text: '  users      — List all registered users', type: 'info' },
          { text: '  prompts    — Show prompt statistics', type: 'info' },
          { text: '  sync       — Toggle public sync', type: 'info' },
          { text: '  clear      — Clear terminal', type: 'info' },
        ]);
        break;
      case 'status':
        setTerminalLines(prev => [...prev,
          { text: `SYSTEM STATUS`, type: 'system' },
          { text: `  Users:    ${users.length}`, type: 'info' },
          { text: `  Prompts:  ${prompts.length}`, type: 'info' },
          { text: `  Public:   ${prompts.filter(p => p.isPublic).length}`, type: 'info' },
          { text: `  Sync:     ${publicSyncEnabled ? 'ON' : 'OFF'}`, type: publicSyncEnabled ? 'success' : 'warning' },
        ]);
        break;
      case 'users':
        setTerminalLines(prev => [...prev,
          { text: `USER REGISTRY [${users.length}]`, type: 'system' },
          ...users.map(u => ({
            text: `  ${u.id.padEnd(12)} ${u.username.padEnd(15)} ${u.email}`,
            type: 'info',
          })),
        ]);
        break;
      case 'prompts':
        setTerminalLines(prev => [...prev,
          { text: `PROMPT INDEX [${prompts.length}]`, type: 'system' },
          { text: `  Total copies: ${prompts.reduce((s, p) => s + p.copies, 0)}`, type: 'info' },
          { text: `  Public: ${prompts.filter(p => p.isPublic).length}`, type: 'info' },
          { text: `  Private: ${prompts.filter(p => !p.isPublic).length}`, type: 'info' },
        ]);
        break;
      case 'sync':
        dispatch({ type: 'TOGGLE_PUBLIC_SYNC' });
        setTerminalLines(prev => [...prev,
          { text: `Public sync ${!publicSyncEnabled ? 'ENABLED' : 'DISABLED'}`, type: !publicSyncEnabled ? 'success' : 'warning' },
        ]);
        break;
      case 'clear':
        setTerminalLines([]);
        break;
      default:
        setTerminalLines(prev => [...prev,
          { text: `Unknown command: "${cmd}". Type "help" for list.`, type: 'error' },
        ]);
    }
  };

  const handleDeleteUser = (userId) => {
    dispatch({ type: 'DELETE_USER', payload: userId });
    addToast('유저가 삭제되었습니다', 'success');
    setTerminalLines(prev => [...prev,
      { text: `> User ${userId} deleted.`, type: 'warning' },
    ]);
  };

  const handleTogglePromptVisibility = (promptId) => {
    dispatch({ type: 'TOGGLE_PROMPT_VISIBILITY', payload: promptId });
  };

  return (
    <motion.div
      className="admin"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="admin__header">
        <div>
          <span className="admin__tag mono">
            <span className="admin__dot admin__dot--red" />
            SYSTEM DASHBOARD
          </span>
          <h1 className="admin__title glitch-text">ADMIN<span className="accent">::</span>CONTROL</h1>
        </div>
        <div className="admin__sync-toggle">
          <span className="admin__sync-label mono">PUBLIC SYNC</span>
          <button
            className={`admin__toggle-switch ${publicSyncEnabled ? 'is-on' : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_PUBLIC_SYNC' })}
            aria-label="퍼블릭 싱크 토글"
          >
            <span className="admin__toggle-knob" />
          </button>
        </div>
      </div>

      <div className="admin__grid">
        {/* Terminal */}
        <div className="admin__terminal">
          <div className="admin__terminal-header">
            <div className="admin__terminal-dots">
              <span className="admin__dot admin__dot--red" />
              <span className="admin__dot admin__dot--yellow" />
              <span className="admin__dot admin__dot--green" />
            </div>
            <span className="admin__terminal-title mono">promptshot — zsh</span>
          </div>
          <div className="admin__terminal-body" ref={terminalRef}>
            {terminalLines.map((line, i) => (
              <div key={i} className={`admin__terminal-line admin__terminal-line--${line.type}`}>
                {line.text}
              </div>
            ))}
          </div>
          <form className="admin__terminal-input-row" onSubmit={handleCommand}>
            <span className="admin__terminal-prompt mono accent">$</span>
            <input
              type="text"
              className="admin__terminal-input mono"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter command..."
              autoFocus
            />
          </form>
        </div>

        {/* Users Panel */}
        <div className="admin__panel">
          <div className="admin__panel-header">
            <span className="admin__panel-title mono">USER REGISTRY</span>
            <span className="admin__panel-count mono">{users.length}</span>
          </div>
          <div className="admin__user-list">
            {users.map((user) => (
              <motion.div
                key={user.id}
                className="admin__user-row"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                layout
              >
                <div className="admin__user-info">
                  <span className="admin__user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <span className="admin__user-name">{user.username}</span>
                    <span className="admin__user-email mono">{user.email}</span>
                  </div>
                </div>
                <button
                  className="admin__delete-btn"
                  onClick={() => handleDeleteUser(user.id)}
                  aria-label={`${user.username} 삭제`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  DELETE
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Prompt visibility control */}
        <div className="admin__panel admin__panel--wide">
          <div className="admin__panel-header">
            <span className="admin__panel-title mono">PROMPT VISIBILITY</span>
            <span className="admin__panel-count mono">{prompts.length}</span>
          </div>
          <div className="admin__prompt-list">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="admin__prompt-row">
                <div className="admin__prompt-info">
                  <div className="admin__prompt-colors">
                    {prompt.colors?.slice(0, 3).map((c, i) => (
                      <div key={i} className="admin__prompt-color-dot" style={{ background: c }} />
                    ))}
                  </div>
                  <span className="admin__prompt-text">{prompt.prompt.substring(0, 60)}...</span>
                </div>
                <div className="admin__prompt-controls">
                  <span className={`admin__prompt-status mono ${prompt.isPublic ? 'is-public' : ''}`}>
                    {prompt.isPublic ? 'PUBLIC' : 'HIDDEN'}
                  </span>
                  <button
                    className={`admin__toggle-switch admin__toggle-switch--sm ${prompt.isPublic ? 'is-on' : ''}`}
                    onClick={() => handleTogglePromptVisibility(prompt.id)}
                    aria-label={`프롬프트 공개 토글`}
                  >
                    <span className="admin__toggle-knob" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
