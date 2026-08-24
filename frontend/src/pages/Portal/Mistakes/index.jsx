import { useEffect, useState } from 'react';
import { Spin, Card, Space, Collapse, Empty } from 'antd';

import portalRequest from '@/request/portalRequest';

export default function PortalMistakesPage() {
  const [loading, setLoading] = useState(true);
  const [bySubject, setBySubject] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await portalRequest.getMistakes();
      if (data.success) setBySubject(data.result.bySubject);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  const totalCount = bySubject.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div>
      <h2>❌ Mening xatolarim</h2>
      {totalCount === 0 ? (
        <Empty description="Hozircha xatolaringiz yo'q — davom eting!" />
      ) : (
        <Collapse
          defaultActiveKey={bySubject.map((g) => g.subject?._id || 'other')}
          items={bySubject.map((group) => ({
            key: group.subject?._id || 'other',
            label: `${group.subject?.name || 'Boshqa'} (${group.items.length})`,
            children: (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {group.items.map(({ question: q, selectedOptionIds, freeTextAnswer, teacherComment }) => {
                  const selected = new Set(selectedOptionIds || []);
                  return (
                    <Card key={q._id} title={q.prompt}>
                      {q.questionType === 'open_response' ? (
                        <>
                          <p>
                            <b>Sizning javobingiz:</b> {freeTextAnswer || <i>bo'sh</i>}
                          </p>
                          {teacherComment && (
                            <p>
                              <b>Ustoz izohi:</b> {teacherComment}
                            </p>
                          )}
                        </>
                      ) : (
                        <Space direction="vertical">
                          {(q.options || []).map((opt) => {
                            const isSelected = selected.has(String(opt._id));
                            const isRight = opt.isCorrect;
                            let color;
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
            ),
          }))}
        />
      )}
    </div>
  );
}
