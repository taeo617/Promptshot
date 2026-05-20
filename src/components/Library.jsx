import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../store/AppContext';
import PromptCard from './PromptCard';
import './Library.css';

export default function Library() {
  const { state, dispatch } = useApp();
  const { prompts, activeTab, currentUser } = state;

  const filteredPrompts = activeTab === 'public'
    ? prompts.filter(p => p.isPublic)
    : prompts.filter(p => p.author === currentUser?.id);

  return (
    <section className="library">
      {/* Header */}
      <div className="library__header">
        <div>
          <span className="library__tag mono">
            <span className="library__dot" />
            PROMPT LIBRARY
          </span>
          <h1 className="library__title">
            프롬프트 라이브러리
          </h1>
          <p className="library__subtitle">
            바로 복사해서 쓸 수 있는 AI 프롬프트 컬렉션
          </p>
        </div>

        {/* Tabs */}
        <div className="library__tabs">
          <button
            className={`library__tab ${activeTab === 'public' ? 'is-active' : ''}`}
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'public' })}
          >
            Public
            <span className="library__tab-count mono">
              {prompts.filter(p => p.isPublic).length}
            </span>
          </button>
          <button
            className={`library__tab ${activeTab === 'personal' ? 'is-active' : ''}`}
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'personal' })}
          >
            Personal
            <span className="library__tab-count mono">
              {prompts.filter(p => p.author === currentUser?.id).length}
            </span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <motion.div className="library__grid" layout>
        <AnimatePresence mode="popLayout">
          {filteredPrompts.length > 0 ? (
            filteredPrompts.map((prompt, index) => (
              <PromptCard key={prompt.id} prompt={prompt} index={index} />
            ))
          ) : (
            <motion.div
              className="library__empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="library__empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
              </div>
              <p className="library__empty-text">
                {activeTab === 'personal'
                  ? '아직 저장한 프롬프트가 없습니다'
                  : '공용 라이브러리가 비어있습니다'
                }
              </p>
              <span className="library__empty-hint mono">
                이미지를 업로드하여 첫 프롬프트를 만들어보세요
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
