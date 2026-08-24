import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Spin, Card, Tag, Space, Progress, Empty } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, ClockCircleOutlined } from '@ant-design/icons';

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
      <Card style={{ marginBottom: 16 }}>
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

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {attempt.answers.map((a, index) => {
          const q = a.question;
          if (!q) return null;
          const selected = new Set(a.selectedOptionIds || []);

          return (
            <Card
              key={index}
              title={`${index + 1}. ${q.prompt}`}
              extra={
                a.isCorrect === null ? (
                  <Tag icon={<ClockCircleOutlined />} color="processing">
                    Tekshirilmoqda
                  </Tag>
                ) : a.isCorrect ? (
                  <Tag icon={<CheckCircleFilled />} color="success">
                    To'g'ri
                  </Tag>
                ) : (
                  <Tag icon={<CloseCircleFilled />} color="error">
                    Noto'g'ri
                  </Tag>
                )
              }
            >
              {q.questionType === 'open_response' ? (
                <>
                  <p>
                    <b>Sizning javobingiz:</b> {a.freeTextAnswer || <i>bo'sh</i>}
                  </p>
                  {a.teacherComment && (
                    <p>
                      <b>Ustoz izohi:</b> {a.teacherComment}
                    </p>
                  )}
                </>
              ) : (
                <Space direction="vertical">
                  {(q.options || []).map((opt) => {
                    const isSelected = selected.has(String(opt._id));
                    const isRight = opt.isCorrect;
                    let color = undefined;
                    if (isRight) color = 'green';
                    else if (isSelected && !isRight) color = 'red';
                    return (
                      <span key={opt._id} style={{ color }}>
                        {isSelected ? '● ' : '○ '}
                        {opt.text}
                        {isRight ? " (to'g'ri javob)" : ''}
                      </span>
                    );
                  })}
                </Space>
              )}
              {q.explanation && (
                <p style={{ marginTop: 8, color: '#888' }}>
                  <b>Izoh:</b> {q.explanation}
                </p>
              )}
            </Card>
          );
        })}
      </Space>
      <div style={{ marginTop: 16 }}>
        <Link to="/portal/history">Tarixga qaytish</Link>
      </div>
    </div>
  );
}
