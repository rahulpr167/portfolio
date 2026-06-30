import { useEffect, useRef, useState, useCallback } from 'react';
import './AdsSection.css';

const SHEET_CSV =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRSWO5R7aKcYkT-lWlp2daIxlSb0-lELPO6s6a-FFkBRkFdlNu3o9LL032ckuGLmSw8TB8_utIvtvnQ/pub?output=csv';

/* Auto-scroll speed in pixels per second */
const AUTO_SPEED  = 72;
/* How long (ms) to wait after interaction before resuming */
const RESUME_DELAY = 3000;

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

/* ─── Carousel ────────────────────────────────────────────────────────────── */
/*
 * Pause / resume model:
 *   Auto-scroll runs via rAF on a doubled card list (seamless infinite loop).
 *   Any user interaction calls pauseScroll() which:
 *     1. Cancels the rAF and any pending resume timer.
 *     2. Snaps scrollLeft out of the second copy so arrows work predictably.
 *   After interaction, scheduleResume() queues a restart after RESUME_DELAY ms.
 *   Resume only fires when: !isHover && isInView && isTabVisible.
 *
 *   Arrow visibility:
 *     • rAF running  → both arrows visible (no edges in the infinite loop)
 *     • rAF stopped  → show/hide based on position within the first copy
 */
const ShowcaseCarousel = ({ cards }) => {
  const n = cards.length; // length of ONE copy

  /* ── DOM refs ── */
  const wrapRef     = useRef(null); // outer wrap — positioning + hover + IO target
  const scrollerRef = useRef(null); // overflow-x scroll container
  const dotRefs     = useRef([]);

  /* ── Behaviour refs (never trigger re-renders) ── */
  const rafRef         = useRef(null);  // rAF id; null = stopped
  const lastTRef       = useRef(null);  // last timestamp; null = skip dt this frame
  const halfWRef       = useRef(0);     // scrollWidth / 2  (= one copy width)
  const isInViewRef    = useRef(false);
  const isTabVisRef    = useRef(!document.hidden);
  const isHoverRef     = useRef(false);
  const resumeTimerRef = useRef(null);  // single resume timer — never duplicated

  /* ── Arrow visibility (the only React state in this component) ── */
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);

  /* ── Drag state ── */
  const dragRef = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0 });

  /* ════════════════════════════════════════════════════════════════════
     HELPERS
     ════════════════════════════════════════════════════════════════════ */

  /* Dynamically measured card width + gap */
  const getCardStep = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return 0;
    const item = el.querySelector('.sc-carousel-item');
    if (!item) return 0;
    return item.offsetWidth + (parseFloat(getComputedStyle(el).gap) || 24);
  }, []);

  /* Sync arrows and active dot from current scroll position.
     When rAF is running: both arrows show (infinite, no edges).
     When stopped: arrows reflect position within the first copy only. */
  const updateUI = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const running = !!rafRef.current;

    if (running) {
      setCanLeft(true);
      setCanRight(true);
    } else {
      const atStart = el.scrollLeft <= 1;
      const maxLeft = (halfWRef.current > 0 ? halfWRef.current : el.scrollWidth) - el.clientWidth;
      const atEnd   = el.scrollLeft >= maxLeft - 1;
      setCanLeft(!atStart);
      setCanRight(!atEnd);
    }

    const step = getCardStep();
    if (step > 0) {
      const rawPos = running
        ? el.scrollLeft % (halfWRef.current || el.scrollWidth)
        : el.scrollLeft;
      const idx = Math.round(rawPos / step) % n;
      dotRefs.current.forEach((dot, i) => {
        if (dot) dot.classList.toggle('sc-dot--on', i === idx);
      });
    }
  }, [n, getCardStep]);

  /* ════════════════════════════════════════════════════════════════════
     MEASURE — kept current on mount + resize
     ════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const measure = () => { halfWRef.current = el.scrollWidth / 2; };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [n]);

  /* ════════════════════════════════════════════════════════════════════
     RAf LOOP
     ════════════════════════════════════════════════════════════════════ */
  const stopRaf = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTRef.current = null;
  }, []);

  const startRaf = useCallback(() => {
    if (rafRef.current) return; // already running

    const tick = (ts) => {
      rafRef.current = requestAnimationFrame(tick);

      /* Pause in-loop if any blocking condition is active */
      if (!isInViewRef.current || !isTabVisRef.current || isHoverRef.current || halfWRef.current <= 0) {
        lastTRef.current = null;
        return;
      }

      const dt = lastTRef.current !== null
        ? Math.min((ts - lastTRef.current) / 1000, 0.1)
        : 0;
      lastTRef.current = ts;

      const el = scrollerRef.current;
      if (!el) return;

      let next = el.scrollLeft + AUTO_SPEED * dt;

      /* Seamless loop — direct scrollLeft assignment bypasses CSS scroll-behavior */
      if (next >= halfWRef.current) {
        el.scrollLeft = next - halfWRef.current;
        lastTRef.current = null; // skip dt spike on next frame
        return;
      }

      el.scrollLeft = next;
      updateUI();
    };

    rafRef.current = requestAnimationFrame(tick);
    updateUI(); // immediately reflect "running" arrow state
  }, [updateUI]);

  /* ════════════════════════════════════════════════════════════════════
     PAUSE / RESUME
     ════════════════════════════════════════════════════════════════════ */

  const canResume = useCallback(() =>
    !isHoverRef.current && isInViewRef.current && isTabVisRef.current
  , []);

  /* Stop rAF, snap out of the second copy, cancel any pending resume */
  const pauseScroll = useCallback(() => {
    clearTimeout(resumeTimerRef.current);
    stopRaf();

    /* If scrollLeft is inside the second copy, jump back to the equivalent
       first-copy position — invisible to the user, keeps arrows sane. */
    const el = scrollerRef.current;
    if (el && halfWRef.current > 0 && el.scrollLeft >= halfWRef.current) {
      el.scrollLeft = el.scrollLeft - halfWRef.current;
    }

    updateUI();
  }, [stopRaf, updateUI]);

  /* Queue a single restart after RESUME_DELAY ms */
  const scheduleResume = useCallback(() => {
    clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      if (canResume()) {
        lastTRef.current = null;
        startRaf();
      }
    }, RESUME_DELAY);
  }, [canResume, startRaf]);

  /* ════════════════════════════════════════════════════════════════════
     INTERSECTION OBSERVER — pause off-screen, resume on entry
     ════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const io = new IntersectionObserver(([entry]) => {
      isInViewRef.current = entry.isIntersecting;

      if (entry.isIntersecting) {
        /* Entered viewport — start if not hovering and not already running */
        if (!isHoverRef.current && !rafRef.current) {
          lastTRef.current = null;
          startRaf();
        }
      } else {
        /* Left viewport — stop to save CPU, cancel pending resume */
        stopRaf();
        clearTimeout(resumeTimerRef.current);
      }
    }, { threshold: 0.1 });

    io.observe(wrap);
    return () => io.disconnect();
  }, [startRaf, stopRaf]);

  /* ════════════════════════════════════════════════════════════════════
     PAGE VISIBILITY
     ════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const onVis = () => {
      isTabVisRef.current = !document.hidden;
      if (!document.hidden) {
        /* Tab became active — resume if conditions pass */
        if (canResume() && !rafRef.current) {
          lastTRef.current = null;
          startRaf();
        }
      } else {
        /* Tab hidden — stop immediately */
        stopRaf();
        clearTimeout(resumeTimerRef.current);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [canResume, startRaf, stopRaf]);

  /* ════════════════════════════════════════════════════════════════════
     SCROLL LISTENER — sync UI + snap after manual / trackpad scroll
     ════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateUI(); // seed initial arrow state

    let snapTimer = null;
    const onScroll = () => {
      updateUI();
      /* When paused, snap to the nearest card once scrolling settles */
      if (!rafRef.current) {
        clearTimeout(snapTimer);
        snapTimer = setTimeout(() => {
          const step = getCardStep();
          if (step <= 0) return;
          const el2 = scrollerRef.current;
          if (!el2) return;
          const nearest = Math.round(el2.scrollLeft / step) * step;
          if (Math.abs(el2.scrollLeft - nearest) > 2) {
            el2.scrollTo({ left: nearest, behavior: 'smooth' });
          }
        }, 120);
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      clearTimeout(snapTimer);
    };
  }, [updateUI, getCardStep]);

  /* Wheel / trackpad — pause + debounced resume */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let wheelEndTimer = null;
    const onWheel = () => {
      if (rafRef.current) pauseScroll();
      /* Debounce: only schedule resume once wheel events stop firing */
      clearTimeout(wheelEndTimer);
      wheelEndTimer = setTimeout(scheduleResume, 400);
    };

    el.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      el.removeEventListener('wheel', onWheel);
      clearTimeout(wheelEndTimer);
    };
  }, [pauseScroll, scheduleResume]);

  /* ════════════════════════════════════════════════════════════════════
     HOVER — pause immediately; schedule resume on leave
     ════════════════════════════════════════════════════════════════════ */
  const onWrapMouseEnter = useCallback(() => {
    isHoverRef.current = true;
    clearTimeout(resumeTimerRef.current); // cancel any pending resume
    if (rafRef.current) {
      stopRaf();
      updateUI(); // switch to edge-aware arrows while paused
    }
  }, [stopRaf, updateUI]);

  const onWrapMouseLeave = useCallback(() => {
    isHoverRef.current = false;
    scheduleResume(); // start the 3-second countdown
  }, [scheduleResume]);

  /* ════════════════════════════════════════════════════════════════════
     ARROW NAVIGATION
     ════════════════════════════════════════════════════════════════════ */
  const navigate = useCallback((dir) => {
    const el = scrollerRef.current;
    if (!el) return;

    pauseScroll(); // stop + snap to first copy

    const step = getCardStep();
    if (step === 0) return;

    const currentCard = Math.round(el.scrollLeft / step);
    const targetCard  = Math.max(0, Math.min(n - 1, currentCard + dir));
    el.scrollTo({ left: targetCard * step, behavior: 'smooth' });

    scheduleResume(); // restart countdown after this interaction
  }, [n, getCardStep, pauseScroll, scheduleResume]);

  /* ════════════════════════════════════════════════════════════════════
     MOUSE DRAG
     ════════════════════════════════════════════════════════════════════ */
  const onMouseDown = useCallback((e) => {
    const el = scrollerRef.current;
    if (!el) return;
    dragRef.current = {
      active: true, moved: false,
      startX: e.pageX,
      scrollLeft: el.scrollLeft,
    };
    el.style.cursor     = 'grabbing';
    el.style.userSelect = 'none';
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    const dx = e.pageX - dragRef.current.startX;
    if (Math.abs(dx) > 4) {
      if (!dragRef.current.moved) {
        dragRef.current.moved = true;
        pauseScroll(); // first real movement — pause
      }
      const el = scrollerRef.current;
      if (el) el.scrollLeft = dragRef.current.scrollLeft - dx;
    }
  }, [pauseScroll]);

  const onMouseUp = useCallback(() => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    const el = scrollerRef.current;
    if (!el) return;
    el.style.cursor     = '';
    el.style.userSelect = '';

    if (dragRef.current.moved) {
      /* Snap to nearest card within the first copy */
      const step = getCardStep();
      if (step > 0) {
        const nearest = Math.round(el.scrollLeft / step) * step;
        const clamped = Math.max(0, Math.min(halfWRef.current - el.clientWidth, nearest));
        el.scrollTo({ left: clamped, behavior: 'smooth' });
      }
      scheduleResume();
    }
  }, [getCardStep, scheduleResume]);

  /* Touch — pause on swipe start, schedule resume when finger lifts */
  const onTouchStart = useCallback(() => {
    pauseScroll();
  }, [pauseScroll]);

  const onTouchEnd = useCallback(() => {
    scheduleResume();
  }, [scheduleResume]);

  /* ════════════════════════════════════════════════════════════════════
     CLEANUP
     ════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    return () => {
      stopRaf();
      clearTimeout(resumeTimerRef.current);
    };
  }, [stopRaf]);

  /* ════════════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════════════ */
  return (
    <div
      ref={wrapRef}
      className="sc-carousel-wrap"
      onMouseEnter={onWrapMouseEnter}
      onMouseLeave={onWrapMouseLeave}
    >
      {/* Scrollable track */}
      <div
        ref={scrollerRef}
        className="sc-carousel-overflow sc-carousel-track"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* First copy — manual navigation operates here */}
        {cards.map((card, i) => (
          <div key={`a-${card.cardId}-${i}`} className="sc-carousel-item">
            <ShowcaseCard card={card} />
          </div>
        ))}
        {/* Second copy — makes the infinite auto-scroll seamless */}
        {cards.map((card, i) => (
          <div key={`b-${card.cardId}-${i}`} className="sc-carousel-item" aria-hidden="true">
            <ShowcaseCard card={card} />
          </div>
        ))}
      </div>

      {/* ── Left nav ── */}
      <button
        className={`sc-nav sc-nav--left${canLeft ? '' : ' sc-nav--hidden'}`}
        onClick={() => navigate(-1)}
        aria-label="Previous"
        aria-disabled={!canLeft}
        tabIndex={canLeft ? 0 : -1}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* ── Right nav ── */}
      <button
        className={`sc-nav sc-nav--right${canRight ? '' : ' sc-nav--hidden'}`}
        onClick={() => navigate(1)}
        aria-label="Next"
        aria-disabled={!canRight}
        tabIndex={canRight ? 0 : -1}
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
