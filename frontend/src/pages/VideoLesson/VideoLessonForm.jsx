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

export default function VideoLessonForm() {
  const form = Form.useFormInstance();
  const [uploading, setUploading] = useState(false);

  const uploadVideo = async (file) => {
    setUploading(true);
    const data = await request.uploadFile({ entity: 'videolesson', file });
    setUploading(false);
    if (data.success) {
      form.setFieldValue('videoUrl', data.result.videoUrl);
      message.success('Video yuklandi');
    }
    return false; // stop antd Upload's own auto-submit — we already sent it
  };

  return (
    <>
      <Form.Item label="Sarlavha" name="title" rules={[{ required: true }]}>
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
        label="Video havolasi yoki yuklangan fayl"
        name="videoUrl"
        rules={[{ required: true, message: "Video havolasini kiriting yoki fayl yuklang" }]}
      >
        <Input placeholder="https://youtube.com/... yoki faylni pastdan yuklang" />
      </Form.Item>
      <Form.Item label="Yoki video faylni yuklang">
        <Upload beforeUpload={uploadVideo} maxCount={1} showUploadList={false} accept="video/*">
          <Button icon={<UploadOutlined />} loading={uploading}>
            {uploading ? 'Yuklanmoqda...' : 'Video fayl tanlash'}
          </Button>
        </Upload>
      </Form.Item>

      <Form.Item label="Tavsif" name="description">
        <TextArea rows={3} />
      </Form.Item>
      <Form.Item label="Davomiyligi (soniya)" name="durationSeconds">
        <InputNumber min={0} style={{ width: '100%' }} />
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
