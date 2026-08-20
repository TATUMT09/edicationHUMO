import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { List, Tag, Spin, Empty, Progress, Space } from 'antd';

import portalRequest from '@/request/portalRequest';

const TEST_TYPE_LABELS = { closed: 'Yopiq test', open: 'Ochiq test', quiz: 'Kviz' };

export default function PortalHistoryPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await portalRequest.getMyAttempts();
      if (data.success) setAttempts(data.result);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  return (
    <div>
      <h2>Ishlagan testlarim</h2>
      {attempts.length === 0 ? (
        <Empty description="Hali hech qanday test ishlamagansiz" />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={attempts}
          renderItem={(attempt) => (
            <List.Item>
              <Link to={`/portal/attempts/${attempt._id}`} style={{ width: '100%', display: 'flex', gap: 16, alignItems: 'center' }}>
                <List.Item.Meta
                  title={attempt.testTitle}
                  description={
                    <Space size={8} style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {attempt.subject?.name && <Tag>{attempt.subject.name}</Tag>}
                      <Tag>{TEST_TYPE_LABELS[attempt.testType] || attempt.testType}</Tag>
                      <span>
                        {new Date(attempt.submittedAt || attempt.startedAt).toLocaleString('uz-UZ')}
                      </span>
                    </Space>
                  }
                />
                <div style={{ minWidth: 160, textAlign: 'right' }}>
                  <Progress percent={attempt.scorePercent} size="small" />
                  <span>
                    {attempt.score} / {attempt.maxScore}
                  </span>
                </div>
              </Link>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
