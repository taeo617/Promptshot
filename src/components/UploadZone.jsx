import { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../store/AppContext';
import './UploadZone.css';

export default function UploadZone() {
  const { state, handleUpload } = useApp();
  const { uploadState, uploadProgress } = state;
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const onFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const stageLabel = uploadState === 'uploading'
    ? 'UPLOADING'
    : uploadState === 'analyzing'
    ? 'AI ANALYZING'
    : uploadState === 'done'
    ? 'COMPLETE'
    : 'READY';

  return (
    <section className="upload-zone-wrapper">
      <div className="upload-zone__header">
        <div className="upload-zone__tag mono">
          <span className="upload-zone__dot" />
          IMAGE UPLOAD
        </div>
        <p className="upload-zone__desc">
          이미지를 업로드하면 AI가 자동으로 컬러와 스타일을 분석합니다
        </p>
      </div>

      <motion.div
        className={`upload-zone ${isDragOver ? 'is-dragover' : ''} ${uploadState !== 'idle' ? 'is-processing' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => uploadState === 'idle' && inputRef.current?.click()}
        whileHover={uploadState === 'idle' ? { scale: 1.005 } : {}}
        transition={{ duration: 0.2 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onFileSelect}
          className="upload-zone__input"
          id="file-upload-input"
        />

        <AnimatePresence mode="wait">
          {uploadState === 'idle' ? (
            <motion.div
              key="idle"
              className="upload-zone__idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="upload-zone__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="upload-zone__label">
                드래그 앤 드롭 또는 <span className="accent">클릭</span>하여 업로드
              </p>
              <span className="upload-zone__formats mono">PNG, JPG, WEBP — MAX 10MB</span>
            </motion.div>
          ) : (
            <motion.div
              key="progress"
              className="upload-zone__progress"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="upload-zone__progress-header">
                <span className="upload-zone__stage mono">{stageLabel}</span>
                <span className="upload-zone__percent mono">{uploadProgress}%</span>
              </div>
              <div className="upload-zone__bar-track">
                <motion.div
                  className="upload-zone__bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.15, ease: 'linear' }}
                />
                <div className="upload-zone__bar-glow" style={{ width: `${uploadProgress}%` }} />
              </div>
              <div className="upload-zone__progress-details mono">
                {uploadState === 'analyzing' && (
                  <span className="upload-zone__analyzing-text">
                    ▸ 컬러 추출 중... 태그 생성 중...
                  </span>
                )}
                {uploadState === 'done' && (
                  <span className="upload-zone__done-text accent">
                    ✓ 분석 완료 — 프롬프트 편집 패널 열림
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag over effect */}
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              className="upload-zone__overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="accent">여기에 놓으세요</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
