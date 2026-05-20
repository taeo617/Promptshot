import { motion } from 'framer-motion';
import UploadZone from './UploadZone';
import PromptCard from './PromptCard';
import { useApp } from '../store/AppContext';
import './Dashboard.css';

export default function Dashboard() {
  const { state } = useApp();
  const { prompts } = state;

  const recentPrompts = [...prompts]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 4);

  const topPrompts = [...prompts]
    .sort((a, b) => b.copies - a.copies)
    .slice(0, 3);

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <motion.section
        className="dashboard__hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="dashboard__hero-content">
          <span className="dashboard__hero-tag mono">AI-POWERED PROMPT EXTRACTION</span>
          <h1 className="dashboard__hero-title">
            이미지에서<br />
            <span className="accent">프롬프트</span>를 추출하세요
          </h1>
          <p className="dashboard__hero-desc">
            이미지를 업로드하면 AI가 컬러, 스타일, 분위기를 분석하여<br />
            최적의 프롬프트를 자동으로 생성합니다
          </p>
        </div>

        {/* Stats */}
        <div className="dashboard__stats">
          <div className="dashboard__stat">
            <span className="dashboard__stat-number">{prompts.length}</span>
            <span className="dashboard__stat-label mono">PROMPTS</span>
          </div>
          <div className="dashboard__stat-divider" />
          <div className="dashboard__stat">
            <span className="dashboard__stat-number">
              {prompts.reduce((s, p) => s + p.copies, 0)}
            </span>
            <span className="dashboard__stat-label mono">COPIES</span>
          </div>
          <div className="dashboard__stat-divider" />
          <div className="dashboard__stat">
            <span className="dashboard__stat-number">
              {new Set(prompts.flatMap(p => p.tags)).size}
            </span>
            <span className="dashboard__stat-label mono">TAGS</span>
          </div>
        </div>
      </motion.section>

      {/* Upload */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <UploadZone />
      </motion.section>

      {/* Recent Prompts */}
      {recentPrompts.length > 0 && (
        <motion.section
          className="dashboard__section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="dashboard__section-header">
            <div>
              <span className="dashboard__section-tag mono">RECENT</span>
              <h2 className="dashboard__section-title">최근 프롬프트</h2>
            </div>
          </div>
          <div className="dashboard__cards-grid">
            {recentPrompts.map((prompt, index) => (
              <PromptCard key={prompt.id} prompt={prompt} index={index} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Top Prompts */}
      {topPrompts.length > 0 && (
        <motion.section
          className="dashboard__section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="dashboard__section-header">
            <div>
              <span className="dashboard__section-tag mono">TRENDING</span>
              <h2 className="dashboard__section-title">인기 프롬프트</h2>
            </div>
          </div>
          <div className="dashboard__cards-row">
            {topPrompts.map((prompt, index) => (
              <PromptCard key={prompt.id} prompt={prompt} index={index} />
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
