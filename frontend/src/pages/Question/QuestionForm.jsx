import { Form, Input, InputNumber, Select, Button, Space, Checkbox } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

import SelectAsync from '@/components/SelectAsync';

const { TextArea } = Input;

const QUESTION_TYPE_OPTIONS = [
  { value: 'single_choice', label: 'Bitta javobli (variantli)' },
  { value: 'multi_choice', label: "Ko'p javobli (variantli)" },
  { value: 'true_false', label: "To'g'ri / Noto'g'ri" },
  { value: 'open_response', label: 'Erkin javob (ochiq)' },
];

export default function QuestionForm() {
  const questionType = Form.useWatch('questionType');
  const hasOptions = questionType !== 'open_response';

  return (
    <>
      <Form.Item label="Test" name="test" rules={[{ required: true, message: 'Testni tanlang' }]}>
        <SelectAsync entity="test" displayLabels={['title']} outputValue="_id" />
      </Form.Item>
      <Form.Item
        label="Savol turi"
        name="questionType"
        rules={[{ required: true, message: "Savol turini tanlang" }]}
      >
        <Select options={QUESTION_TYPE_OPTIONS} placeholder="Tanlang" />
      </Form.Item>
      <Form.Item
        label="Savol matni"
        name="prompt"
        rules={[{ required: true, message: 'Savol matnini kiriting' }]}
      >
        <TextArea rows={3} />
      </Form.Item>
      <Form.Item label="Rasm havolasi (ixtiyoriy)" name="imageUrl">
        <Input placeholder="https://..." />
      </Form.Item>
      <Form.Item label="Ball" name="points" initialValue={1}>
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      {hasOptions ? (
        <Form.List name="options">
          {(optionFields, { add, remove }) => (
            <>
              <label>Javob variantlari</label>
              {optionFields.map((field) => (
                <Space
                  key={field.key}
                  align="baseline"
                  style={{ display: 'flex', marginTop: 8, width: '100%' }}
                >
                  <Form.Item
                    name={[field.name, 'text']}
                    rules={[{ required: true, message: 'Matn kiriting' }]}
                    style={{ marginBottom: 0, width: 300 }}
                  >
                    <Input placeholder="Variant matni" />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, 'isCorrect']}
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Checkbox>To'g'ri</Checkbox>
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                </Space>
              ))}
              <Form.Item style={{ marginTop: 8 }}>
                <Button
                  type="dashed"
                  onClick={() => add({ text: '', isCorrect: false })}
                  icon={<PlusOutlined />}
                >
                  Variant qo'shish
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      ) : (
        <Form.Item label="Namunaviy javob (faqat ustozga ko'rinadi)" name="correctAnswerText">
          <TextArea rows={3} />
        </Form.Item>
      )}

      <Form.Item label="Izoh (natijada ko'rsatiladi, ixtiyoriy)" name="explanation">
        <TextArea rows={2} />
      </Form.Item>
    </>
  );
}
