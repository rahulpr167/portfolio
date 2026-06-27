import { useEffect, useRef, useCallback } from 'react';
import { useState } from 'react';
import './AdsSection.css';

const SHEET_CSV =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRSWO5R7aKcYkT-lWlp2daIxlSb0-lELPO6s6a-FFkBRkFdlNu3o9LL032ckuGLmSw8TB8_utIvtvnQ/pub?output=csv';

const SCROLL_SPEED = 90; // px per second — tweak for pace

/* ─── CSV parser ──────────────────────────────────────────────────────────── */
const parseCSV = (text) => {
  const rows = text.split(/\r?\n/).filter((l) => l.trim());
  if (rows.length <= 1) return [];
  const headers = rows[0].split(',').map((h) => h.trim());
  return rows.slice(1).map((row) => {
    const fields = [];
    let cur = '', inQ = false;
    for (const ch of row) {
      if (ch === '"') inQ = !inQ;
      else if (ch === ',' && !inQ) { fields.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    fields.push(cur.trim());
    return Object.fromEntries(
      headers.map((h, i) => {
        let v = fields[i] || '';
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        return [h, v];
      })
    );
  });
};

/* ─── Individual Card — design unchanged ─────────────────────────────────── */
const ShowcaseCard = ({ card }) => {
  const [imgErr, setImgErr] = useState(false);

  const openLink = () =>
    window.open(card.link, '_blank', 'noopener,noreferrer');

  return (
    <article
      className="sc-card sc-card--on"
      onClick={openLink}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && openLink()}
      aria-label={`Open ${card.title}`}
    >
      <div className="sc-img-wrap">
        {!imgErr ? (
          <img
            src={card.imageUrl}
            alt={card.title}
            className="sc-img"
            loading="lazy"
            decoding="async"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div
            className="sc-img-fallback"
            style={{
              background: `linear-gradient(135deg,
                hsl(${(parseInt(card.cardId, 10) * 67) % 360}, 35%, 14%),
                hsl(${(parseInt(card.cardId, 10) * 67 + 120) % 360}, 45%, 8%))`
            }}
          />
        )}
      </div>

      <div className="sc-info">
        <span className="sc-info-title">{card.title}</span>
        <span
          className="sc-info-cta"
          onClick={(e) => { e.stopPropagation(); openLink(); }}
          role="button"
          tabIndex={-1}
        >
          View
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12L12 2M12 2H5M12 2v7" />
          </svg>
        </span>
      </div>
    </article>
  );
};

/* ─── Infinite Continuous Carousel ───────────────────────────────────────── */
// Technique: double the card array, drive translateX via rAF.
// When position reaches halfWidth, reset to 0 — completely seamless since
// the second copy is pixel-identical to the first.
const ShowcaseCarousel = ({ cards }) => {
  const n = cards.length;

  const trackRef       = useRef(null);
  const dotRefs        = useRef([]);
  const posRef         = useRef(0);        // current scroll offset in px
  const pausedRef      = useRef(false);
  const lastTRef       = useRef(null);     // null = "just resumed, skip dt"
  const rafRef         = useRef(null);
  const halfWRef       = useRef(0);        // scrollWidth / 2
  const pauseTimerRef  = useRef(null);

  /* ── Measure half-width once and on resize ── */
  useEffect(() => {
    if (!trackRef.current) return;

    const measure = () => {
      if (trackRef.current)
        halfWRef.current = trackRef.current.scrollWidth / 2;
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [n]);

  /* ── rAF animation loop ── */
  useEffect(() => {
    if (n === 0) return;

    const animate = (timestamp) => {
      // dt = 0 on first frame after resume to avoid position jump
      const dt = lastTRef.current !== null
        ? Math.min((timestamp - lastTRef.current) / 1000, 0.1)
        : 0;
      lastTRef.current = timestamp;

      if (!pausedRef.current && halfWRef.current > 0) {
        posRef.current = (posRef.current + SCROLL_SPEED * dt) % halfWRef.current;

        // Move track — single style write per frame, no React re-render
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(${-posRef.current}px)`;
        }

        // Update dots — direct DOM, zero React cost
        const dotIdx = Math.floor((posRef.current / halfWRef.current) * n) % n;
        dotRefs.current.forEach((el, i) => {
          if (el) el.classList.toggle('sc-dot--on', i === dotIdx);
        });
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [n]);

  /* ── Navigate: jump forward/back by one card width ── */
  const navigate = useCallback((dir) => {
    if (halfWRef.current === 0 || n === 0) return;
    const cardStep = halfWRef.current / n;
    posRef.current =
      ((posRef.current + dir * cardStep) % halfWRef.current + halfWRef.current) % halfWRef.current;
    lastTRef.current = null; // prevent dt spike after jump
  }, [n]);

  /* ── Hover pause / resume ── */
  const handleMouseEnter = () => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pausedRef.current = true;
    lastTRef.current  = null;
  };
  const handleMouseLeave = () => {
    pauseTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
      lastTRef.current  = null;
    }, 300);
  };

  return (
    <div
      className="sc-carousel-wrap"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Overflow clip lives on a child so nav buttons aren't clipped */}
      <div className="sc-carousel-overflow">
        <div ref={trackRef} className="sc-carousel-track">
          {/* Original set */}
          {cards.map((card, i) => (
            <div key={`a-${card.cardId}-${i}`} className="sc-carousel-item">
              <ShowcaseCard card={card} />
            </div>
          ))}
          {/* Cloned set — makes the loop seamless */}
          {cards.map((card, i) => (
            <div key={`b-${card.cardId}-${i}`} className="sc-carousel-item" aria-hidden="true">
              <ShowcaseCard card={card} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Left nav ── */}
      <button
        className="sc-nav sc-nav--left"
        onClick={() => navigate(-1)}
        aria-label="Previous"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* ── Right nav ── */}
      <button
        className="sc-nav sc-nav--right"
        onClick={() => navigate(1)}
        aria-label="Next"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* ── Dot indicators ── */}
      <div className="sc-dots-row" role="tablist" aria-label="Carousel position">
        {cards.map((_, i) => (
          <span
            key={i}
            ref={el => { dotRefs.current[i] = el; }}
            className={`sc-dot${i === 0 ? ' sc-dot--on' : ''}`}
            role="tab"
            aria-label={`Item ${i + 1} of ${n}`}
          />
        ))}
      </div>
    </div>
  );
};

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="sc-card sc-card--on sc-skeleton">
    <div className="sc-img-wrap sc-skel-img shimmer" />
    <div className="sc-info">
      <div className="sc-skel-title shimmer" />
      <div className="sc-skel-btn shimmer" />
    </div>
  </div>
);

/* ─── Main AdsSection ───────────────────────────────────────────────────── */
const AdsSection = () => {
  const [cards,   setCards]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${SHEET_CSV}&t=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const parsed = parseCSV(await res.text());
        const valid  = parsed
          .filter((c) => c.imageUrl && c.link && c.cardId)
          .reverse();
        setCards(valid);
      } catch (e) {
        console.error('AdsSection:', e);
        setError('Could not load showcase content.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="sc-section">
        <div className="sc-skeleton-row">
          <Skeleton /><Skeleton /><Skeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sc-section">
        <div className="sc-error glass">
          <span>⚠ {error}</span>
          <button className="sc-retry" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!cards.length) return null;

  return (
    <div className="sc-section">
      <ShowcaseCarousel cards={cards} />
    </div>
  );
};

export default AdsSection;
