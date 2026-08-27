import { useState } from 'react';
import { Form, Input, Switch, Select, Upload, Button, message } from 'antd';
import { UploadOutlined, FileDoneOutlined } from '@ant-design/icons';

import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';

const { TextArea } = Input;

const LEVEL_OPTIONS = [
  { value: 'beginner', label: "Boshlang'ich" },
  { value: 'intermediate', label: "O'rta" },
  { value: 'advanced', label: 'Yuqori' },
];

const CATEGORY_OPTIONS = [
  { value: 'study', label: "O'quv adabiyoti (fan/darajaga bog'liq)" },
  { value: 'fiction', label: "Badiiy adabiyot (fan/darajasiz)" },
];

export default function BookForm() {
  const form = Form.useFormInstance();
  const [uploading, setUploading] = useState(false);
  const category = Form.useWatch('category', form) || 'study';
  const fileUrl = Form.useWatch('fileUrl', form);

  const uploadBook = async (file) => {
    setUploading(true);
    const data = await request.uploadFile({ entity: 'book', file });
    setUploading(false);
    if (data.success) {
      form.setFieldValue('fileUrl', data.result.fileUrl);
      message.success('Fayl yuklandi');
    }
    return false;
  };

  return (
    <>
      <Form.Item label="Sarlavha" name="title" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Muallif" name="author">
        <Input />
      </Form.Item>
      <Form.Item label="Turkumi" name="category" initialValue="study">
        <Select
          options={CATEGORY_OPTIONS}
          onChange={(value) => {
            if (value === 'fiction') form.setFieldsValue({ subject: undefined, level: undefined });
          }}
        />
      </Form.Item>
      {category === 'study' && (
        <>
          <Form.Item
            label="Fan"
            name="subject"
            rules={[{ required: true, message: 'Fanni tanlang' }]}
          >
            <SelectAsync entity="subject" displayLabels={['name']} outputValue="_id" />
          </Form.Item>
          <Form.Item
            label="Daraja"
            name="level"
            rules={[{ required: true, message: 'Darajani tanlang' }]}
          >
            <Select options={LEVEL_OPTIONS} placeholder="Tanlang" />
          </Form.Item>
        </>
      )}

      <Form.Item label="Kitob fayli (PDF)" required>
        <Upload beforeUpload={uploadBook} maxCount={1} showUploadList={false} accept=".pdf">
          <Button icon={<UploadOutlined />} loading={uploading}>
            {uploading ? 'Yuklanmoqda...' : fileUrl ? 'Boshqa fayl tanlash' : 'PDF fayl tanlash'}
          </Button>
        </Upload>
        {fileUrl && (
          <div style={{ marginTop: 8, color: '#52c41a' }}>
            <FileDoneOutlined /> Fayl yuklandi
          </div>
        )}
        <Form.Item
          name="fileUrl"
          rules={[{ required: true, message: 'PDF fayl yuklang' }]}
          style={{ marginBottom: 0 }}
        >
          <Input type="hidden" />
        </Form.Item>
      </Form.Item>

      <Form.Item label="Tavsif" name="description">
        <TextArea rows={3} />
      </Form.Item>
      <Form.Item label="Yoqilgan" name="enabled" valuePropName="checked" initialValue={true}>
        <Switch />
      </Form.Item>
    </>
  );
}
