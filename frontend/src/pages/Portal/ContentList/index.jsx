import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, List, Spin, Empty, Tag, Segmented } from 'antd';
import { PlayCircleOutlined, FileTextOutlined, ReadOutlined, CheckCircleFilled } from '@ant-design/icons';

import portalRequest from '@/request/portalRequest';
import { BASE_URL } from '@/config/serverApiConfig';

const LEVEL_LABELS = { beginner: "Boshlang'ich", intermediate: "O'rta", advanced: 'Yuqori' };
const TEST_TYPE_LABELS = { closed: 'Yopiq test', open: 'Ochiq test', quiz: 'Kviz' };

export default function PortalContentListPage() {
  const { subjectId, level } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ subject: null, videos: [], books: [], tests: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('video');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await portalRequest.getContent(subjectId, { level });
      if (res.success) setData(res.result);
      setLoading(false);
    })();
  }, [subjectId, level]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  const items = [
    ...data.videos.map((v) => ({ ...v, kind: 'video' })),
    ...(data.books || []).map((b) => ({ ...b, kind: 'book' })),
    ...data.tests.map((t) => ({ ...t, kind: t.testType })),
  ].filter((item) => item.kind === filter);

  const pathFor = (item) => {
    if (item.kind === 'video') return `/portal/video/${item._id}`;
    if (item.kind === 'book') return `/portal/books/${item._id}`;
    // Tests are single-attempt — once done, go straight to the result.
    if (item.completedAttempt) return `/portal/attempts/${item.completedAttempt._id}`;
    return `/portal/tests/${item._id}`;
  };

  return (
    <div>
      <h2>
        {data.subject?.name} — {LEVEL_LABELS[level] || level}
      </h2>
      <div style={{ overflowX: 'auto', marginBottom: 16 }}>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { label: 'Video darslar', value: 'video' },
            { label: 'Kitoblar', value: 'book' },
            { label: 'Yopiq test', value: 'closed' },
            { label: 'Ochiq test', value: 'open' },
            { label: 'Kviz', value: 'quiz' },
          ]}
        />
      </div>
      {items.length === 0 ? (
        <Empty description="Bu bo'limda hali kontent yo'q" />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2 }}
          dataSource={items}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                onClick={() => navigate(pathFor(item))}
                cover={
                  item.kind === 'book' && item.coverImage ? (
                    <img
                      src={BASE_URL + item.coverImage}
                      alt={item.title}
                      style={{ height: 160, objectFit: 'cover', borderBottom: '1px solid #f0f0f0' }}
                    />
                  ) : undefined
                }
              >
                <Card.Meta
                  avatar={
                    item.kind === 'book' && item.coverImage
                      ? undefined
                      : item.kind === 'video' ? (
                      <PlayCircleOutlined style={{ fontSize: 24, color: '#1640D6' }} />
                    ) : item.kind === 'book' ? (
                      <ReadOutlined style={{ fontSize: 24, color: '#1640D6' }} />
                    ) : (
                      <FileTextOutlined style={{ fontSize: 24, color: '#1640D6' }} />
                    )
                  }
                  title={item.title}
                  description={
                    item.kind === 'video' ? (
                      <Tag>Video dars</Tag>
                    ) : item.kind === 'book' ? (
                      <Tag>{item.author || 'Kitob'}</Tag>
                    ) : (
                      <>
                        <Tag>{TEST_TYPE_LABELS[item.testType]}</Tag>
                        {item.completedAttempt ? (
                          <Tag color="success" icon={<CheckCircleFilled />}>
                            Bajarildi — {item.completedAttempt.scorePercent}%
                          </Tag>
                        ) : (
                          <span>{item.questionCount} ta savol</span>
                        )}
                      </>
                    )
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
