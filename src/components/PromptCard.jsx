import { motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import './PromptCard.css';

export default function PromptCard({ prompt, index }) {
  const { dispatch, addToast } = useApp();

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.prompt).then(() => {
      dispatch({ type: 'INCREMENT_COPY', payload: prompt.id });
      addToast('프롬프트가 복사되었습니다', 'success');
    });
  };

  const timeAgo = getTimeAgo(prompt.createdAt);

  return (
    <motion.article
      className="prompt-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      layout
    >
      {/* Image preview */}
      {prompt.image && (
        <div className="prompt-card__image-wrap">
          <img src={prompt.image} alt="" className="prompt-card__image" />
          <div className="prompt-card__image-overlay" />
        </div>
      )}

      {/* Color bar */}
      <div className="prompt-card__color-bar">
        {prompt.colors?.slice(0, 5).map((color, i) => (
          <div
            key={i}
            className="prompt-card__color-segment"
            style={{ background: color }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="prompt-card__body">
        {/* Tags */}
        <div className="prompt-card__tags">
          {prompt.tags?.map((tag, i) => (
            <span key={i} className="prompt-card__tag mono">{tag}</span>
          ))}
        </div>

        {/* Prompt text */}
        <p className="prompt-card__text">{prompt.prompt}</p>

        {/* Footer */}
        <div className="prompt-card__footer">
          <div className="prompt-card__meta mono">
            <span className="prompt-card__time">{timeAgo}</span>
            <span className="prompt-card__copies">{prompt.copies} copies</span>
          </div>
        </div>
      </div>

      {/* Hover overlay with copy button */}
      <div className="prompt-card__hover-overlay">
        <button className="prompt-card__copy-btn" onClick={handleCopy}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          복사
        </button>
      </div>
    </motion.article>
  );
}

function getTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return `${days}일 전`;
}
