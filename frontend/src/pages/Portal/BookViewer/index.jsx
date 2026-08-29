import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spin, Empty, Segmented } from 'antd';
import { DownloadOutlined, SunOutlined, MoonOutlined, CoffeeOutlined } from '@ant-design/icons';

import portalRequest from '@/request/portalRequest';
import { BASE_URL } from '@/config/serverApiConfig';

function isUploadedFile(url) {
  return !!url && !/^https?:\/\//i.test(url);
}

const THEME_STORAGE_KEY = 'portal_book_reader_theme';

// The PDF itself renders inside the browser's own (cross-origin-isolated)
// viewer, so its page background can't be restyled from here — these
// themes only cover the space around it, which is the actual "qolgan joy"
// (remaining area) being decorated.
const THEMES = {
  light: {
    label: 'Kunduzgi',
    icon: <SunOutlined />,
    background: 'linear-gradient(135deg, #fdfbf6 0%, #f3ecd9 100%)',
    text: '#3d3427',
    frame: '#fff',
    frameBorder: '#e8dfc8',
  },
  sepia: {
    label: "Yumshoq",
    icon: <CoffeeOutlined />,
    background: 'linear-gradient(135deg, #eef2e6 0%, #dbe6d3 100%)',
    text: '#33402f',
    frame: '#fbfdf8',
    frameBorder: '#c9d9bf',
  },
  dark: {
    label: 'Tungi',
    icon: <MoonOutlined />,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    text: '#e8e6f0',
    frame: '#0f1424',
    frameBorder: '#2c3454',
  },
};

export default function PortalBookViewerPage() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [themeKey, setThemeKey] = useState('light');

  useEffect(() => {
    (async () => {
      const data = await portalRequest.getBook(bookId);
      if (data.success) setBook(data.result);
      setLoading(false);
    })();
  }, [bookId]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved && THEMES[saved]) setThemeKey(saved);
    } catch (err) {
      // localStorage unavailable — just keep the default theme
    }
  }, []);

  const changeTheme = (value) => {
    setThemeKey(value);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, value);
    } catch (err) {
      // best-effort — not persisting is fine
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!book) return <Empty description="Kitob topilmadi" />;

  const theme = THEMES[themeKey];
  const fileHref = isUploadedFile(book.fileUrl) ? BASE_URL + book.fileUrl : book.fileUrl;
  // Chrome/Edge's built-in PDF viewer honors these open-parameters — hides
  // its own toolbar and the thumbnail/outline side panel so only the page
  // content shows, instead of a second toolbar+sidebar UI stacked inside
  // ours. (Not part of any spec, so a browser that ignores them just shows
  // its normal viewer — never a broken result.)
  const embedHref = `${fileHref}#toolbar=0&navpanes=0`;

  return (
    // Full-bleed, same technique as the library grid — the reading theme
    // should fill the whole screen, not just a centered column.
    <div
      style={{
        width: '100vw',
        position: 'relative',
        left: '50%',
        marginLeft: '-50vw',
        background: theme.background,
        color: theme.text,
        padding: '24px 16px 40px',
        transition: 'background 0.3s ease',
      }}
    >
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: theme.text }}>{book.title}</h2>
            {book.author && <p style={{ margin: '4px 0 0' }}>Muallif: {book.author}</p>}
          </div>
          <Segmented
            value={themeKey}
            onChange={changeTheme}
            options={Object.entries(THEMES).map(([value, t]) => ({
              value,
              label: t.label,
              icon: t.icon,
            }))}
          />
        </div>

        {/* Rendered by the browser's own PDF viewer, right here on the
            page — no new tab. Narrower + centered (not the full 1000px
            container) because most scanned book pages are portrait —
            stretching the frame wide just leaves the browser's own PDF
            viewer to fill the leftover width with its own dark backdrop,
            which is the black bars on the sides; a page-shaped frame
            leaves much less of that space to show at all. */}
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <iframe
            src={embedHref}
            title={book.title}
            style={{
              width: '100%',
              height: '78vh',
              border: `1px solid ${theme.frameBorder}`,
              borderRadius: 10,
              background: theme.frame,
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <a
            href={fileHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: theme.text, opacity: 0.85 }}
          >
            <DownloadOutlined /> Yuklab olish / yangi oynada ochish
          </a>
          {' · '}
          <Link to="/portal/library" style={{ color: theme.text, opacity: 0.85 }}>
            Kutubxonaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
