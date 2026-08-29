import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spin, Empty, Card } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

import portalRequest from '@/request/portalRequest';
import { BASE_URL } from '@/config/serverApiConfig';

function isUploadedFile(url) {
  return !!url && !/^https?:\/\//i.test(url);
}

export default function PortalBookViewerPage() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await portalRequest.getBook(bookId);
      if (data.success) setBook(data.result);
      setLoading(false);
    })();
  }, [bookId]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!book) return <Empty description="Kitob topilmadi" />;

  const fileHref = isUploadedFile(book.fileUrl) ? BASE_URL + book.fileUrl : book.fileUrl;

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{book.title}</h2>
        {book.author && <p style={{ margin: '4px 0 0' }}>Muallif: {book.author}</p>}
        {book.description && <p style={{ margin: '4px 0 0' }}>{book.description}</p>}
      </Card>

      {/* Rendered by the browser's own PDF viewer, right here on the page —
          no new tab. */}
      <iframe
        src={fileHref}
        title={book.title}
        style={{ width: '100%', height: '80vh', border: '1px solid #f0f0f0', borderRadius: 8 }}
      />

      <div style={{ marginTop: 12 }}>
        <a href={fileHref} target="_blank" rel="noopener noreferrer">
          <DownloadOutlined /> Yuklab olish / yangi oynada ochish
        </a>
        {' · '}
        <Link to="/portal/library">Kutubxonaga qaytish</Link>
      </div>
    </div>
  );
}
