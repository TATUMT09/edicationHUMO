import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spin, Radio, Checkbox, Input, Button, Card, Space, message, Empty } from 'antd';

import portalRequest from '@/request/portalRequest';

const { TextArea } = Input;

export default function PortalTestTakePage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    (async () => {
      const data = await portalRequest.getTestToTake(testId);
      if (data.success) {
        setTest(data.result.test);
        setQuestions(data.result.questions);
      }
      setLoading(false);
    })();
  }, [testId]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!test) return <Empty description="Test topilmadi" />;

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const onSubmit = async () => {
    setSubmitting(true);
    const payload = questions.map((q) => {
      const a = answers[q._id] || {};
      return {
        question: q._id,
        selectedOptionIds: a.selectedOptionIds || [],
        freeTextAnswer: a.freeTextAnswer || '',
      };
    });
    const data = await portalRequest.submitAttempt(testId, payload);
    setSubmitting(false);
    if (data.success) {
      navigate(`/portal/attempts/${data.result._id}`);
    } else {
      message.error(data.message || 'Xatolik yuz berdi');
    }
  };

  return (
    <div>
      <h2>{test.title}</h2>
      {test.description && <p>{test.description}</p>}
      {test.timeLimitMinutes ? <p>Tavsiya etilgan vaqt: {test.timeLimitMinutes} daqiqa</p> : null}

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {questions.map((q, index) => (
          <Card key={q._id} title={`${index + 1}. ${q.prompt}`}>
            {q.imageUrl && (
              <img src={q.imageUrl} alt="" style={{ maxWidth: '100%', marginBottom: 12 }} />
            )}
            {q.questionType === 'multi_choice' ? (
              <Checkbox.Group
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                value={answers[q._id]?.selectedOptionIds || []}
                onChange={(vals) => setAnswer(q._id, { selectedOptionIds: vals })}
              >
                {q.options.map((opt) => (
                  <Checkbox key={opt._id} value={opt._id}>
                    {opt.text}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            ) : q.questionType === 'open_response' ? (
              <TextArea
                rows={4}
                value={answers[q._id]?.freeTextAnswer || ''}
                onChange={(e) => setAnswer(q._id, { freeTextAnswer: e.target.value })}
                placeholder="Javobingizni yozing..."
              />
            ) : (
              <Radio.Group
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                value={answers[q._id]?.selectedOptionIds?.[0]}
                onChange={(e) => setAnswer(q._id, { selectedOptionIds: [e.target.value] })}
              >
                {q.options.map((opt) => (
                  <Radio key={opt._id} value={opt._id}>
                    {opt.text}
                  </Radio>
                ))}
              </Radio.Group>
            )}
          </Card>
        ))}
      </Space>

      <Button
        type="primary"
        size="large"
        block
        style={{ marginTop: 24 }}
        loading={submitting}
        onClick={onSubmit}
      >
        Yuborish
      </Button>
    </div>
  );
}
