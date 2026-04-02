import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../mediaManifest';
import LightboxModal from '../components/LightboxModal';
import './CategoryPage.css';

// ── Skeleton placeholder count shown while loading ────────────────────────────
const SKELETON_COUNT = 12;

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const category = CATEGORIES.find((c) => c.slug === categorySlug);

  const [media,         setMedia]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [loaded,        setLoaded]        = useState({});

  // ── Fetch media from /api/projects/{slug} ─────────────────────────────────
  const fetchMedia = useCallback(() => {
    if (!category) return;

    setLoading(true);
    setError(null);
    setMedia([]);
    setLoaded({});

    fetch(`/api/projects/${categorySlug}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // API now returns a flat array directly (not { resources: [...] })
        const flat = Array.isArray(data) ? data : [];
        const mapped = flat.map((r) => ({
          id:       r.public_id,
          url:      r.url,
          isVideo:  r.type === 'video',
          filename: r.public_id?.split('/').pop() ?? '',
        }));
        setMedia(mapped);
      })
      .catch((err) => {
        console.error('Media fetch error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [categorySlug, category]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);
  useEffect(() => { window.scrollTo(0, 0); }, [categorySlug]);

  // ── Lightbox helpers ──────────────────────────────────────────────────────
  const openLightbox  = (i) => setLightboxIndex(i);
  const closeLightbox = ()  => setLightboxIndex(null);
  const prevItem      = ()  => setLightboxIndex((i) => (i - 1 + media.length) % media.length);
  const nextItem      = ()  => setLightboxIndex((i) => (i + 1) % media.length);
  const markLoaded    = (i) => setLoaded((prev) => ({ ...prev, [i]: true }));

  // ── Category not found ───────────────────────────────────────────────────
  if (!category) {
    return (
      <div className="cat-error">
        <div className="cat-empty-icon">🔍</div>
        <h2>Category not found</h2>
        <button className="btn-back" onClick={() => navigate('/')}>← Back to Portfolio</button>
      </div>
    );
  }

  return (
    <div className="cat-page">
      {/* ── Sticky header ── */}
      <header className="cat-header glass">
        <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="cat-title">{category.name}</h1>
        <span className="cat-count">
          {loading ? '…' : `${media.length} ${media.length === 1 ? 'item' : 'items'}`}
        </span>
      </header>

      <div className="cat-glow-top" />

      {/* ── Loading: skeleton cards ── */}
      {loading && (
        <div className="media-grid">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="media-card skeleton-card" />
          ))}
        </div>
      )}

      {/* ── Error state ── */}
      {!loading && error && (
        <div className="cat-empty">
          <div className="cat-empty-icon">⚠️</div>
          <h3>Could not load media</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{error}</p>
          <button className="btn-back" style={{ marginTop: '20px' }} onClick={fetchMedia}>
            Retry
          </button>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && media.length === 0 && (
        <div className="cat-empty">
          <div className="cat-empty-icon">🎨</div>
          <h3>Coming Soon</h3>
          <p>This gallery is being prepared. Check back soon!</p>
        </div>
      )}

      {/* ── Media grid ── */}
      {!loading && !error && media.length > 0 && (
        <div className="media-grid">
          {media.map((item, index) => (
            <div
              key={item.id}
              className={`media-card ${loaded[index] ? 'media-card--loaded' : ''}`}
              onClick={() => openLightbox(index)}
            >
              {item.isVideo ? (
                <div className="media-video-wrapper">
                  <video
                    src={item.url}
                    preload="metadata"
                    muted
                    className="media-thumb"
                    onLoadedMetadata={() => markLoaded(index)}
                  />
                  <div className="media-play-overlay">
                    <span className="play-icon">▶</span>
                  </div>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={item.filename}
                  loading="lazy"
                  decoding="async"
                  className="media-thumb"
                  onLoad={() => markLoaded(index)}
                />
              )}
              <div className="media-hover-overlay">
                <span className="media-hover-icon">{item.isVideo ? '▶' : '⤢'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <LightboxModal
          media={media}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevItem}
          onNext={nextItem}
        />
      )}
    </div>
  );
};

export default CategoryPage;
