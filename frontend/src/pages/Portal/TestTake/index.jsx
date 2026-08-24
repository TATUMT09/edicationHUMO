import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Spin,
  Radio,
  Checkbox,
  Input,
  Button,
  Card,
  Space,
  message,
  Empty,
  Progress,
  Tag,
  Alert,
} from 'antd';

import portalRequest from '@/request/portalRequest';
import { randomCorrectMessage, randomIncorrectMessage } from '../motivationMessages';

const { TextArea } = Input;

export default function PortalTestTakePage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [loadingMeta, setLoadingMeta] = useState(true);
  const [meta, setMeta] = useState(null); // { test, availableCount, allowedTiers }
  const [chosenCount, setChosenCount] = useState(null);
  const [revealMode, setRevealMode] = useState('end'); // 'end' | 'immediate'

  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [sessionToken, setSessionToken] = useState(null);
  const [answers, setAnswers] = useState({});
  const [checkResults, setCheckResults] = useState({}); // { [questionId]: { isCorrect, message } }
  const [checking, setChecking] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    (async () => {
      setLoadingMeta(true);
      const data = await portalRequest.getTestMeta(testId);
      if (data.success) {
        setMeta(data.result);
        setChosenCount(data.result.allowedTiers[data.result.allowedTiers.length - 1] || null);
      }
      setLoadingMeta(false);
    })();
  }, [testId]);

  const startTest = async () => {
    if (!chosenCount) return;
    setLoadingQuestions(true);
    const data = await portalRequest.getTestToTake(testId, chosenCount);
    setLoadingQuestions(false);
    if (data.success) {
      setTest(data.result.test);
      setQuestions(data.result.questions);
      setSessionToken(data.result.sessionToken);
      setCurrentIndex(0);
      if (data.result.test.timePerQuestionSeconds) {
        setTimeLeft(data.result.test.timePerQuestionSeconds);
      }
    } else {
      message.error(data.message || 'Xatolik yuz berdi');
    }
  };

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const buildPayload = () =>
    questions.map((q) => {
      const a = answers[q._id] || {};
      return {
        question: q._id,
        selectedOptionIds: a.selectedOptionIds || [],
        freeTextAnswer: a.freeTextAnswer || '',
      };
    });

  const onSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    const data = await portalRequest.submitAttempt(testId, buildPayload(), sessionToken);
    setSubmitting(false);
    if (data.success) {
      navigate(`/portal/attempts/${data.result._id}`, {
        state: {
          starsEarned: data.result.starsEarned,
          rankBefore: data.result.rankBefore,
          rankAfter: data.result.rankAfter,
        },
      });
    } else {
      submittingRef.current = false;
      message.error(data.message || 'Xatolik yuz berdi');
    }
  };

  const checkOne = async (q, selectedOptionIds) => {
    if (revealMode !== 'immediate' || q.questionType === 'open_response') return;
    setChecking((prev) => ({ ...prev, [q._id]: true }));
    const data = await portalRequest.checkAnswer(testId, {
      questionId: q._id,
      selectedOptionIds,
    });
    setChecking((prev) => ({ ...prev, [q._id]: false }));
    if (data.success) {
      setCheckResults((prev) => ({
        ...prev,
        [q._id]: {
          isCorrect: data.result.isCorrect,
          message: data.result.isCorrect ? randomCorrectMessage() : randomIncorrectMessage(),
        },
      }));
    }
  };

  // Per-question countdown — only active when the test has
  // timePerQuestionSeconds set, in which case questions are shown one at a
  // time instead of all on one page.
  const timedMode = !!test?.timePerQuestionSeconds;

  useEffect(() => {
    if (!timedMode || !questions.length) return undefined;
    if (timeLeft == null) return undefined;
    if (timeLeft <= 0) {
      goToNext();
      return undefined;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, timedMode]);

  const goToNext = () => {
    if (currentIndex >= questions.length - 1) {
      onSubmit();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setTimeLeft(test.timePerQuestionSeconds);
  };

  if (loadingMeta) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!meta) return <Empty description="Test topilmadi" />;

  // Stage 1 — chooser: pick question count + reveal mode before loading any
  // questions.
  if (!test) {
    return (
      <div>
        <h2>{meta.test.title}</h2>
        {meta.test.description && <p>{meta.test.description}</p>}

        <Card style={{ marginBottom: 16 }}>
          <p>
            <b>Nechta savol ishlaysiz?</b> (jami {meta.availableCount} ta savol mavjud)
          </p>
          <Space wrap>
            {meta.allowedTiers.map((tier) => (
              <Button
                key={tier}
                type={chosenCount === tier ? 'primary' : 'default'}
                onClick={() => setChosenCount(tier)}
              >
                {tier} ta
              </Button>
            ))}
          </Space>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <p>
            <b>Javoblar qachon ko'rsatilsin?</b>
          </p>
          <Radio.Group value={revealMode} onChange={(e) => setRevealMode(e.target.value)}>
            <Radio value="end">Faqat oxirida</Radio>
            <Radio value="immediate">Har javobdan keyin darhol</Radio>
          </Radio.Group>
        </Card>

        <Button type="primary" size="large" loading={loadingQuestions} onClick={startTest}>
          Boshlash
        </Button>
      </div>
    );
  }

  const renderQuestionBody = (q) => {
    const result = checkResults[q._id];
    const disabled = revealMode === 'immediate' && checking[q._id];

    return (
      <>
        {q.imageUrl && (
          <img src={q.imageUrl} alt="" style={{ maxWidth: '100%', marginBottom: 12 }} />
        )}
        {q.questionType === 'multi_choice' ? (
          <>
            <Checkbox.Group
              disabled={disabled}
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
            {revealMode === 'immediate' && (
              <Button
                size="small"
                style={{ marginTop: 8 }}
                loading={checking[q._id]}
                onClick={() => checkOne(q, answers[q._id]?.selectedOptionIds || [])}
              >
                Javobni tekshirish
              </Button>
            )}
          </>
        ) : q.questionType === 'open_response' ? (
          <TextArea
            rows={4}
            value={answers[q._id]?.freeTextAnswer || ''}
            onChange={(e) => setAnswer(q._id, { freeTextAnswer: e.target.value })}
            placeholder="Javobingizni yozing..."
          />
        ) : (
          <Radio.Group
            disabled={disabled}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            value={answers[q._id]?.selectedOptionIds?.[0]}
            onChange={(e) => {
              setAnswer(q._id, { selectedOptionIds: [e.target.value] });
              checkOne(q, [e.target.value]);
            }}
          >
            {q.options.map((opt) => (
              <Radio key={opt._id} value={opt._id}>
                {opt.text}
              </Radio>
            ))}
          </Radio.Group>
        )}
        {result && (
          <Alert
            style={{ marginTop: 12 }}
            type={result.isCorrect ? 'success' : 'error'}
            message={result.message}
            showIcon
          />
        )}
      </>
    );
  };

  // Stage 2b — timed, one question at a time.
  if (timedMode) {
    const q = questions[currentIndex];
    const percent = Math.round((timeLeft / test.timePerQuestionSeconds) * 100);
    return (
      <div>
        <h2>{test.title}</h2>
        <Space align="center" style={{ marginBottom: 16 }}>
          <Tag color="blue">
            {currentIndex + 1} / {questions.length}
          </Tag>
          <Progress
            type="circle"
            size={48}
            percent={percent}
            format={() => timeLeft}
            status={timeLeft <= 5 ? 'exception' : 'active'}
          />
        </Space>
        <Card title={`${currentIndex + 1}. ${q.prompt}`}>{renderQuestionBody(q)}</Card>
        <Button
          type="primary"
          size="large"
          block
          style={{ marginTop: 24 }}
          loading={submitting}
          onClick={goToNext}
        >
          {currentIndex >= questions.length - 1 ? 'Yakunlash' : 'Keyingisi'}
        </Button>
      </div>
    );
  }

  // Stage 2a — untimed, all questions on one page.
  return (
    <div>
      <h2>{test.title}</h2>
      {test.description && <p>{test.description}</p>}
      {test.timeLimitMinutes ? <p>Tavsiya etilgan vaqt: {test.timeLimitMinutes} daqiqa</p> : null}

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {questions.map((q, index) => (
          <Card key={q._id} title={`${index + 1}. ${q.prompt}`}>
            {renderQuestionBody(q)}
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
