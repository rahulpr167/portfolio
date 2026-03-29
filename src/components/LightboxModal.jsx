import { useState, useEffect, useCallback } from 'react';
import './LightboxModal.css';

const LightboxModal = ({ media, currentIndex, onClose, onPrev, onNext }) => {
  const item = media[currentIndex];

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  if (!item) return null;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">✕</button>

      <button
        className="lightbox-nav lightbox-prev"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        aria-label="Previous"
      >‹</button>

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        {item.isVideo ? (
          <video
            src={item.url}
            controls
            autoPlay
            className="lightbox-media"
          />
        ) : (
          <img
            src={item.url}
            alt={item.filename}
            className="lightbox-media"
          />
        )}
        <p className="lightbox-caption">{item.filename} · {currentIndex + 1} / {media.length}</p>
      </div>

      <button
        className="lightbox-nav lightbox-next"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        aria-label="Next"
      >›</button>
    </div>
  );
};

export default LightboxModal;
