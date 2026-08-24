import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Empty, Button, Card } from 'antd';
import { FilePdfOutlined, DownloadOutlined } from '@ant-design/icons';

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
      <Card>
        <FilePdfOutlined style={{ fontSize: 48, color: '#cf1322', marginBottom: 16 }} />
        <h2>{book.title}</h2>
        {book.author && <p>Muallif: {book.author}</p>}
        {book.description && <p>{book.description}</p>}
        <Button
          type="primary"
          size="large"
          icon={<DownloadOutlined />}
          href={fileHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          Kitobni ochish
        </Button>
      </Card>
    </div>
  );
}
