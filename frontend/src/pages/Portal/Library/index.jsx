import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Spin, Empty, Input, Select, Tag, Segmented } from 'antd';
import { ReadOutlined, StarFilled } from '@ant-design/icons';

import portalRequest from '@/request/portalRequest';
import { BASE_URL } from '@/config/serverApiConfig';

const LEVEL_OPTIONS = [
  { value: 'beginner', label: "Boshlang'ich" },
  { value: 'intermediate', label: "O'rta" },
  { value: 'advanced', label: 'Yuqori' },
];
const LEVEL_LABELS = { beginner: "Boshlang'ich", intermediate: "O'rta", advanced: 'Yuqori' };

const CATEGORY_OPTIONS = [
  { value: 'fiction', label: 'Badiiy adabiyot' },
  { value: 'study', label: "O'quv adabiyoti" },
];

function BookCard({ book, navigate, highlighted }) {
  return (
    <List.Item>
      <Card
        hoverable
        onClick={() => navigate(`/portal/books/${book._id}`)}
        cover={
          book.coverImage ? (
            <img
              src={BASE_URL + book.coverImage}
              alt={book.title}
              style={{ height: 180, objectFit: 'cover', borderBottom: '1px solid #f0f0f0' }}
            />
          ) : undefined
        }
      >
        <Card.Meta
          avatar={
            book.coverImage ? undefined : highlighted ? (
              <StarFilled style={{ fontSize: 24, color: '#faad14' }} />
            ) : (
              <ReadOutlined style={{ fontSize: 24, color: '#1640D6' }} />
            )
          }
          title={book.title}
          description={
            <>
              <Tag>{book.author || 'Kitob'}</Tag>
              {book.level && <Tag>{LEVEL_LABELS[book.level] || book.level}</Tag>}
            </>
          }
        />
      </Card>
    </List.Item>
  );
}

export default function PortalLibraryPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [category, setCategory] = useState('fiction');
  const [subjectId, setSubjectId] = useState(undefined);
  const [level, setLevel] = useState(undefined);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ books: [], recommended: [] });

  useEffect(() => {
    (async () => {
      const res = await portalRequest.getSubjects();
      if (res.success) setSubjects(res.result);
    })();
  }, []);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(async () => {
      const res = await portalRequest.getLibrary({ subjectId, level, q, category });
      if (res.success) setData(res.result);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [subjectId, level, q, category]);

  const showStudyFilters = category !== 'fiction';

  return (
    <div>
      <h2>📚 Kutubxona</h2>

      <div style={{ overflowX: 'auto', marginBottom: 16 }}>
        <Segmented
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(value) => {
            setCategory(value);
            if (value === 'fiction') {
              setSubjectId(undefined);
              setLevel(undefined);
            }
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <Input.Search
          placeholder="Kitob yoki muallif qidirish..."
          allowClear
          style={{ maxWidth: 280 }}
          onChange={(e) => setQ(e.target.value)}
        />
        {showStudyFilters && (
          <>
            <Select
              allowClear
              placeholder="Fan"
              style={{ minWidth: 160 }}
              options={subjects.map((s) => ({ value: s._id, label: s.name }))}
              value={subjectId}
              onChange={setSubjectId}
            />
            <Select
              allowClear
              placeholder="Daraja"
              style={{ minWidth: 160 }}
              options={LEVEL_OPTIONS}
              value={level}
              onChange={setLevel}
            />
          </>
        )}
      </div>

      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />
      ) : (
        <>
          {data.recommended?.length > 0 && (
            <>
              <h3>⭐ Sizga tavsiya</h3>
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                dataSource={data.recommended}
                renderItem={(book) => (
                  <BookCard book={book} navigate={navigate} highlighted />
                )}
                style={{ marginBottom: 24 }}
              />
            </>
          )}

          <h3>Barcha kitoblar</h3>
          {data.books.length === 0 ? (
            <Empty description="Kitob topilmadi" />
          ) : (
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
              dataSource={data.books}
              renderItem={(book) => <BookCard book={book} navigate={navigate} />}
            />
          )}
        </>
      )}
    </div>
  );
}
