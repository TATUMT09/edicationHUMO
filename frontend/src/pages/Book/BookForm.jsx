import { useState } from 'react';
import { Form, Input, InputNumber, Switch, Select, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';

const { TextArea } = Input;

const LEVEL_OPTIONS = [
  { value: 'beginner', label: "Boshlang'ich" },
  { value: 'intermediate', label: "O'rta" },
  { value: 'advanced', label: 'Yuqori' },
];

export default function BookForm() {
  const form = Form.useFormInstance();
  const [uploading, setUploading] = useState(false);

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
      <Form.Item label="Fan" name="subject" rules={[{ required: true, message: 'Fanni tanlang' }]}>
        <SelectAsync entity="subject" displayLabels={['name']} outputValue="_id" />
      </Form.Item>
      <Form.Item
        label="Daraja"
        name="level"
        rules={[{ required: true, message: 'Darajani tanlang' }]}
      >
        <Select options={LEVEL_OPTIONS} placeholder="Tanlang" />
      </Form.Item>

      <Form.Item
        label="Fayl havolasi yoki yuklangan fayl"
        name="fileUrl"
        rules={[{ required: true, message: "Fayl havolasini kiriting yoki PDF yuklang" }]}
      >
        <Input placeholder="https://... yoki PDF faylni pastdan yuklang" />
      </Form.Item>
      <Form.Item label="Yoki PDF faylni yuklang">
        <Upload beforeUpload={uploadBook} maxCount={1} showUploadList={false} accept=".pdf">
          <Button icon={<UploadOutlined />} loading={uploading}>
            {uploading ? 'Yuklanmoqda...' : 'PDF fayl tanlash'}
          </Button>
        </Upload>
      </Form.Item>

      <Form.Item label="Tavsif" name="description">
        <TextArea rows={3} />
      </Form.Item>
      <Form.Item label="Tartib raqami" name="order">
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="Yoqilgan" name="enabled" valuePropName="checked" initialValue={true}>
        <Switch />
      </Form.Item>
    </>
  );
}
