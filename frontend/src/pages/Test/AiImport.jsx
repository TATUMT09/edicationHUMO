import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Button,
  Card,
  Form,
  Input,
  Select,
  Checkbox,
  Space,
  Spin,
  message,
  Empty,
} from 'antd';
import {
  InboxOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';

const { Dragger } = Upload;
const { TextArea } = Input;

const LEVEL_OPTIONS = [
  { value: 'beginner', label: "Boshlang'ich" },
  { value: 'intermediate', label: "O'rta" },
  { value: 'advanced', label: 'Yuqori' },
];
const TEST_TYPE_OPTIONS = [
  { value: 'closed', label: 'Yopiq test' },
  { value: 'open', label: 'Ochiq test' },
  { value: 'quiz', label: 'Kviz' },
];
const QUESTION_TYPE_OPTIONS = [
  { value: 'single_choice', label: 'Bitta javobli' },
  { value: 'multi_choice', label: "Ko'p javobli" },
  { value: 'true_false', label: "To'g'ri/Noto'g'ri" },
  { value: 'open_response', label: 'Erkin javob' },
];

export default function TestAiImport() {
  const navigate = useNavigate();
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsed, setParsed] = useState(null);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState();
  const [level, setLevel] = useState();
  const [testType, setTestType] = useState();
  const [questions, setQuestions] = useState([]);

  const handleFile = async (file) => {
    setParsing(true);
    const data = await request.uploadFile({ entity: 'test', file, path: 'test/ai-parse' });
    setParsing(false);
    if (data.success) {
      setParsed(data.result);
      setTitle(data.result.title || '');
      setQuestions(data.result.questions || []);
    }
    return false;
  };

  const updateQuestion = (index, patch) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };
  const updateOption = (qIndex, oIndex, patch) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qIndex
          ? q
          : { ...q, options: q.options.map((o, j) => (j === oIndex ? { ...o, ...patch } : o)) }
      )
    );
  };
  const addOption = (qIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qIndex ? q : { ...q, options: [...(q.options || []), { text: '', isCorrect: false }] }
      )
    );
  };
  const removeOption = (qIndex, oIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qIndex ? q : { ...q, options: q.options.filter((_, j) => j !== oIndex) }
      )
    );
  };
  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { prompt: '', questionType: 'single_choice', options: [], points: 1 },
    ]);
  };

  const onSave = async () => {
    if (!subject || !level || !testType) {
      message.error("Fan, daraja va test turini tanlang");
      return;
    }
    setSaving(true);
    const data = await request.postTo({
      path: 'test/ai-import',
      jsonData: { title, subject, level, testType, questions },
    });
    setSaving(false);
    if (data.success) {
      navigate('/test');
    }
  };

  if (!parsed) {
    return (
      <div>
        <h2>AI orqali test yuklash</h2>
        <p>
          .docx faylni yuklang — sun'iy intellekt savollarni va to'g'ri javoblarni avtomatik
          aniqlab beradi (qalin yoki tagiga chizilgan variant — to'g'ri javob deb hisoblanadi).
        </p>
        <Spin spinning={parsing} tip="AI o'qiyapti, biroz kuting...">
          <Dragger
            accept=".docx"
            multiple={false}
            showUploadList={false}
            beforeUpload={handleFile}
            disabled={parsing}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p>.docx faylni shu yerga tashlang yoki bosib tanlang</p>
          </Dragger>
        </Spin>
      </div>
    );
  }

  return (
    <div>
      <h2>Natijani tekshiring va saqlang</h2>
      <Card style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Form.Item label="Sarlavha" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Form.Item>
          <Space size={16} wrap>
            <Form.Item label="Fan" required style={{ minWidth: 220 }}>
              <SelectAsync
                entity="subject"
                displayLabels={['name']}
                outputValue="_id"
                onChange={setSubject}
              />
            </Form.Item>
            <Form.Item label="Daraja" required style={{ minWidth: 180 }}>
              <Select options={LEVEL_OPTIONS} value={level} onChange={setLevel} />
            </Form.Item>
            <Form.Item label="Test turi" required style={{ minWidth: 180 }}>
              <Select options={TEST_TYPE_OPTIONS} value={testType} onChange={setTestType} />
            </Form.Item>
          </Space>
        </Form>
      </Card>

      {questions.length === 0 ? (
        <Empty description="Savollar yo'q" />
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {questions.map((q, qIndex) => (
            <Card
              key={qIndex}
              title={`${qIndex + 1}-savol`}
              extra={
                <DeleteOutlined onClick={() => removeQuestion(qIndex)} style={{ color: 'red' }} />
              }
            >
              <TextArea
                rows={2}
                value={q.prompt}
                onChange={(e) => updateQuestion(qIndex, { prompt: e.target.value })}
                placeholder="Savol matni"
                style={{ marginBottom: 12 }}
              />
              <Select
                options={QUESTION_TYPE_OPTIONS}
                value={q.questionType}
                onChange={(v) => updateQuestion(qIndex, { questionType: v })}
                style={{ width: 220, marginBottom: 12 }}
              />

              {q.questionType === 'open_response' ? (
                <TextArea
                  rows={2}
                  value={q.correctAnswerText || ''}
                  onChange={(e) => updateQuestion(qIndex, { correctAnswerText: e.target.value })}
                  placeholder="Namunaviy javob"
                />
              ) : (
                <>
                  {(q.options || []).map((opt, oIndex) => (
                    <Space key={oIndex} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                      <Input
                        value={opt.text}
                        onChange={(e) => updateOption(qIndex, oIndex, { text: e.target.value })}
                        style={{ width: 320 }}
                      />
                      <Checkbox
                        checked={opt.isCorrect}
                        onChange={(e) =>
                          updateOption(qIndex, oIndex, { isCorrect: e.target.checked })
                        }
                      >
                        To'g'ri
                      </Checkbox>
                      <MinusCircleOutlined onClick={() => removeOption(qIndex, oIndex)} />
                    </Space>
                  ))}
                  <Button
                    type="dashed"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => addOption(qIndex)}
                  >
                    Variant qo'shish
                  </Button>
                </>
              )}
            </Card>
          ))}
        </Space>
      )}

      <Button type="dashed" block style={{ marginTop: 16 }} icon={<PlusOutlined />} onClick={addQuestion}>
        Savol qo'shish
      </Button>

      <Button
        type="primary"
        size="large"
        block
        style={{ marginTop: 24 }}
        loading={saving}
        onClick={onSave}
      >
        Testni saqlash ({questions.length} ta savol)
      </Button>
    </div>
  );
}
