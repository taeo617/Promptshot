import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { useState, useEffect } from 'react';
import './SlidePanel.css';

export default function SlidePanel() {
  const { state, dispatch, addToast } = useApp();
  const { isSlidePanelOpen, analysisResult, uploadedImage, currentUser, publicSyncEnabled } = state;
  const [editedPrompt, setEditedPrompt] = useState('');

  // Sync prompt when analysis changes
  useEffect(() => {
    if (analysisResult?.promptSuggestion) {
      setEditedPrompt(analysisResult.promptSuggestion);
    }
  }, [analysisResult]);

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_SLIDE_PANEL', payload: false });
    setTimeout(() => {
      dispatch({ type: 'RESET_UPLOAD' });
      setEditedPrompt('');
    }, 400);
  };

  const handleSave = () => {
    if (!editedPrompt.trim()) return;

    const newPrompt = {
      id: `prompt_${Date.now()}`,
      image: uploadedImage,
      prompt: editedPrompt.trim(),
      tags: analysisResult?.tags || [],
      colors: analysisResult?.colors || [],
      author: currentUser?.id || 'anonymous',
      isPublic: publicSyncEnabled,
      createdAt: Date.now(),
      copies: 0,
    };

    dispatch({ type: 'ADD_PROMPT', payload: newPrompt });
    addToast('프롬프트가 라이브러리에 저장되었습니다', 'success');
    handleClose();
  };

  return (
    <AnimatePresence>
      {isSlidePanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="slide-panel__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.aside
            className="slide-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Close */}
            <div className="slide-panel__header">
              <div>
                <span className="slide-panel__tag mono">ANALYSIS RESULT</span>
                <h2 className="slide-panel__title">프롬프트 편집</h2>
              </div>
              <button className="slide-panel__close" onClick={handleClose} aria-label="패널 닫기">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Preview */}
            {uploadedImage && (
              <div className="slide-panel__preview">
                <img src={uploadedImage} alt="업로드된 이미지 미리보기" className="slide-panel__image" />
              </div>
            )}

            {/* Colors */}
            {analysisResult?.colors && (
              <div className="slide-panel__section">
                <span className="slide-panel__label mono">EXTRACTED COLORS</span>
                <div className="slide-panel__colors">
                  {analysisResult.colors.map((color, i) => (
                    <div key={i} className="slide-panel__color-chip">
                      <div className="slide-panel__color-swatch" style={{ background: color }} />
                      <span className="mono">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {analysisResult?.tags && (
              <div className="slide-panel__section">
                <span className="slide-panel__label mono">AI TAGS</span>
                <div className="slide-panel__tags">
                  {analysisResult.tags.map((tag, i) => (
                    <span key={i} className="slide-panel__tag-pill">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt editor */}
            <div className="slide-panel__section slide-panel__section--grow">
              <span className="slide-panel__label mono">PROMPT</span>
              <textarea
                className="slide-panel__textarea"
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                placeholder="프롬프트를 입력하거나 수정하세요..."
                rows={6}
              />
            </div>

            {/* Actions */}
            <div className="slide-panel__actions">
              <button className="slide-panel__btn slide-panel__btn--ghost" onClick={handleClose}>
                취소
              </button>
              <button className="slide-panel__btn slide-panel__btn--primary" onClick={handleSave}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                라이브러리에 저장
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
