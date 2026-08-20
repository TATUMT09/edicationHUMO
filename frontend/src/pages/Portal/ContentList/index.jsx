import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, List, Spin, Empty, Tag, Segmented } from 'antd';
import { PlayCircleOutlined, FileTextOutlined } from '@ant-design/icons';

import portalRequest from '@/request/portalRequest';

const LEVEL_LABELS = { beginner: "Boshlang'ich", intermediate: "O'rta", advanced: 'Yuqori' };
const TEST_TYPE_LABELS = { closed: 'Yopiq test', open: 'Ochiq test', quiz: 'Kviz' };

export default function PortalContentListPage() {
  const { subjectId, level } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ subject: null, videos: [], tests: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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
    ...data.tests.map((t) => ({ ...t, kind: t.testType })),
  ].filter((item) => filter === 'all' || item.kind === filter);

  return (
    <div>
      <h2>
        {data.subject?.name} — {LEVEL_LABELS[level] || level}
      </h2>
      <Segmented
        style={{ marginBottom: 16 }}
        value={filter}
        onChange={setFilter}
        options={[
          { label: 'Hammasi', value: 'all' },
          { label: 'Video darslar', value: 'video' },
          { label: 'Yopiq test', value: 'closed' },
          { label: 'Ochiq test', value: 'open' },
          { label: 'Kviz', value: 'quiz' },
        ]}
      />
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
                onClick={() =>
                  navigate(
                    item.kind === 'video' ? `/portal/video/${item._id}` : `/portal/tests/${item._id}`
                  )
                }
              >
                <Card.Meta
                  avatar={
                    item.kind === 'video' ? (
                      <PlayCircleOutlined style={{ fontSize: 24, color: '#1640D6' }} />
                    ) : (
                      <FileTextOutlined style={{ fontSize: 24, color: '#1640D6' }} />
                    )
                  }
                  title={item.title}
                  description={
                    item.kind === 'video' ? (
                      <Tag>Video dars</Tag>
                    ) : (
                      <>
                        <Tag>{TEST_TYPE_LABELS[item.testType]}</Tag>
                        <span>{item.questionCount} ta savol</span>
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
