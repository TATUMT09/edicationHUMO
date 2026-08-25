import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Spin, Card, Tag, Space, Progress, Empty } from 'antd';

import portalRequest from '@/request/portalRequest';
import { randomScoreMessage } from '../motivationMessages';

const LEVEL_LABELS = { beginner: "Boshlang'ich", intermediate: "O'rta", advanced: 'Yuqori' };

export default function PortalAttemptDetailPage() {
  const { attemptId } = useParams();
  const location = useLocation();
  const { starsEarned, rankBefore, rankAfter } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await portalRequest.getAttempt(attemptId);
      if (data.success) setAttempt(data.result);
      setLoading(false);
    })();
  }, [attemptId]);

  const scoreMessage = useMemo(
    () => (attempt?.status === 'graded' ? randomScoreMessage(attempt.scorePercent) : null),
    [attempt?._id, attempt?.status, attempt?.scorePercent]
  );

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!attempt) return <Empty description="Natija topilmadi" />;

  return (
    <div>
      {starsEarned > 0 && (
        <Card
          style={{
            marginBottom: 16,
            background: 'linear-gradient(135deg, #fff7e6, #fff1b8)',
            borderColor: '#ffd666',
          }}
        >
          <h2 style={{ margin: 0 }}>🎉 Test tugallandi!</h2>
          <p style={{ fontSize: 20, fontWeight: 'bold', margin: '8px 0' }}>
            ⭐ +{starsEarned} Stars
          </p>
          {rankBefore != null && rankAfter != null && rankBefore !== rankAfter && (
            <p style={{ margin: 0 }}>
              🏆 Reyting: #{rankBefore} → #{rankAfter}
            </p>
          )}
        </Card>
      )}
      <Card>
        <h2>{attempt.testTitle}</h2>
        <Space>
          {attempt.level && <Tag>{LEVEL_LABELS[attempt.level] || attempt.level}</Tag>}
          <span>
            Ball: {attempt.score} / {attempt.maxScore}
          </span>
        </Space>
        <Progress percent={attempt.scorePercent} style={{ marginTop: 12, maxWidth: 400 }} />
        {scoreMessage && (
          <p style={{ marginTop: 12, fontSize: 16, fontWeight: 'bold' }}>{scoreMessage}</p>
        )}
      </Card>

      <div style={{ marginTop: 16 }}>
        <Link to="/portal/history">Tarixga qaytish</Link>
      </div>
    </div>
  );
}
