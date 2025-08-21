import React, { useEffect, useMemo, useRef, useState } from 'react';

interface Article {
  title: string;
  description: string;
  url: string;
  image?: string;
}

// Scrollable row with controls: bigger images, title below, auto-roll RTL every 5s
const NewsTicker: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState<boolean>(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('http://localhost:8083/newsfeed/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        const items = Array.isArray(data?.articles) ? data.articles : [];
        setArticles(items);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Auto-advance right-to-left every 5s (scrollLeft increases)
  useEffect(() => {
    if (paused || !viewportRef.current || articles.length === 0) return;

    const el = viewportRef.current;
    const step = () => {
      if (!el) return;
      const amount = Math.floor(el.clientWidth * 0.9); // almost a page
      const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
      if (nearEnd) {
        // After smooth finishes, jump back to start without animation
        el.scrollBy({ left: amount, behavior: 'smooth' });
        window.setTimeout(() => {
          el.scrollTo({ left: 0, behavior: 'auto' });
        }, 700);
      } else {
        el.scrollBy({ left: amount, behavior: 'smooth' });
      }
    };

    const id = window.setInterval(step, 5000);
    return () => window.clearInterval(id);
  }, [paused, articles.length]);

  const scroll = (direction: 'left' | 'right') => {
    const el = viewportRef.current;
    if (!el) return;
    const amount = Math.floor(el.clientWidth * 0.9);
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!articles.length) return <div>No crime news available</div>;

  return (
    <div
      className="news-ticker"
      style={{
        width: '100%',
        border: '1px solid #1f2937',
        background: '#0b1221',
        color: '#ffffff',
        borderRadius: 6,
        overflow: 'hidden',
      }}
      aria-label="Latest news carousel"
    >
      <style>{`
        .ticker-shell { display: flex; align-items: stretch; }
        .ticker-label {
          flex: 0 0 auto;
          padding: 12px;
          background: #1f2937;
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-right: 1px solid #111827;
          display: flex; align-items: center;
        }
        .ticker-viewport {
          position: relative;
          overflow-x: auto;
          overflow-y: hidden;
          flex: 1 1 auto;
          height: 360px; /* fits bigger image + title */
          scroll-behavior: smooth;
          -ms-overflow-style: none; /* IE/Edge */
          scrollbar-width: none; /* Firefox */
        }
        .ticker-viewport::-webkit-scrollbar { display: none; }

        .ticker-row {
          display: flex;
          align-items: stretch;
          height: 100%;
          padding: 16px 8px;
          box-sizing: border-box;
        }
        .ticker-item {
          flex: 0 0 auto;
          width: 360px; /* card width for ~3 per wide viewport */
          padding: 0 8px;
          box-sizing: border-box;
        }
        .ticker-card {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          text-decoration: none;
          color: #e5e7eb;
          background: transparent;
          gap: 12px;
          width: 100%;
          min-width: 0;
        }
        .ticker-thumb {
          width: 100%;
          height: 240px; /* bigger image */
          border-radius: 10px;
          object-fit: cover;
          background: #0f172a;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.06) inset;
        }
        .ticker-thumb.placeholder { background: linear-gradient(135deg, #0f172a, #111827); }
        .ticker-title {
          font-size: 18px;
          font-weight: 700;
          color: #f3f4f6;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 46px;
          white-space: normal;
        }

        /* Nav buttons */
        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,0.5);
          color: #fff;
          border: none;
          border-radius: 9999px;
          padding: 8px;
          cursor: pointer;
          z-index: 10;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .nav-left { left: 8px; }
        .nav-right { right: 8px; }
        .nav-icon { width: 24px; height: 24px; }

        /* Responsiveness */
        @media (max-width: 1024px) {
          .ticker-viewport { height: 330px; }
          .ticker-thumb { height: 210px; }
          .ticker-item { width: 320px; }
        }
        @media (max-width: 640px) {
          .ticker-viewport { height: 300px; }
          .ticker-thumb { height: 180px; }
          .ticker-item { width: 280px; }
        }
      `}</style>

      <div className="px-4 md:px-12">
        <div className="ticker-label"></div>
        <div
          className="ticker-viewport"
          ref={viewportRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Left Button */}
          <button className="nav-btn nav-left" onClick={() => scroll('left')} aria-label="Scroll left">
            {/* Inline SVG chevron left */}
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Row */}
          <div className="ticker-row">
            {articles.map((article, idx) => (
              <div key={idx} className="ticker-item">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ticker-card"
                  title={article.title}
                >
                  {article.image ? (
                    <img
                      className="ticker-thumb"
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                    />
                  ) : (
                    <span className="ticker-thumb placeholder" aria-hidden="true" />
                  )}
                  <span className="ticker-title">{article.title}</span>
                </a>
              </div>
            ))}
          </div>

          {/* Right Button */}
          <button className="nav-btn nav-right" onClick={() => scroll('right')} aria-label="Scroll right">
            {/* Inline SVG chevron right */}
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
                <div className="ticker-label"></div>
      </div>
    </div>
  );
};

export default NewsTicker;
