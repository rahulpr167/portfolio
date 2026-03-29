import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../mediaManifest';
import LightboxModal from '../components/LightboxModal';
import './CategoryPage.css';

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const category = CATEGORIES.find(c => c.slug === categorySlug);

  const [media, setMedia]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ── Fetch media from Vercel API → Cloudinary ─────────────────────────────
  useEffect(() => {
    if (!category) return;

    setLoading(true);
    setError(null);
    setMedia([]);

    fetch(`/api/projects/${categorySlug}`)
      .then(res => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then(data => {
        const mapped = (data.resources || []).map(r => ({
          id:      r.id,
          url:     r.url,
          isVideo: r.type === 'video',
          filename: r.id.split('/').pop(),       // last segment of public_id
        }));
        setMedia(mapped);
      })
      .catch(err => {
        console.error('Media fetch error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [categorySlug, category]);
  // ─────────────────────────────────────────────────────────────────────────

  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [loaded, setLoaded]               = useState({});

  useEffect(() => { window.scrollTo(0, 0); }, [categorySlug]);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevItem = () => setLightboxIndex(i => (i - 1 + media.length) % media.length);
  const nextItem = () => setLightboxIndex(i => (i + 1) % media.length);
  const markLoaded = (i) => setLoaded(prev => ({ ...prev, [i]: true }));

  if (!category) {
    return (
      <div className="cat-error">
        <h2>Category not found.</h2>
        <button onClick={() => navigate('/')} className="btn-back">← Back to Portfolio</button>
      </div>
    );
  }

  return (
    <div className="cat-page">
      {/* Sticky header */}
      <header className="cat-header glass">
        <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="cat-title">{category.name}</h1>
        <span className="cat-count">
          {loading ? '…' : `${media.length} ${media.length === 1 ? 'item' : 'items'}`}
        </span>
      </header>

      <div className="cat-glow-top" />

      {/* Loading spinner */}
      {loading && (
        <div className="cat-empty">
          <div className="cat-spinner" />
          <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Loading media…</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="cat-empty">
          <div className="cat-empty-icon">⚠️</div>
          <h3>Could not load media</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{error}</p>
          <button
            className="btn-back"
            style={{ marginTop: '20px' }}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && media.length === 0 && (
        <div className="cat-empty">
          <div className="cat-empty-icon">📂</div>
          <h3>Coming Soon</h3>
          <p>Upload files to <code>portfolio/images/{categorySlug}</code> on Cloudinary to see them here.</p>
        </div>
      )}

      {/* Media Grid */}
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

      {/* Lightbox */}
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
