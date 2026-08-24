import { useState } from 'react';
import { Form, Input, InputNumber, Switch, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

import { request } from '@/request';

const { TextArea } = Input;

export default function RewardForm() {
  const form = Form.useFormInstance();
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file) => {
    setUploading(true);
    const data = await request.uploadFile({ entity: 'reward', file });
    setUploading(false);
    if (data.success) {
      form.setFieldValue('imageUrl', data.result.imageUrl);
      message.success('Rasm yuklandi');
    }
    return false;
  };

  return (
    <>
      <Form.Item label="Nomi" name="title" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        label="Narxi (⭐)"
        name="starCost"
        rules={[{ required: true, message: 'Narxni kiriting' }]}
      >
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="Miqdori (bo'sh = cheksiz)" name="stock">
        <InputNumber min={0} style={{ width: '100%' }} placeholder="Cheksiz" />
      </Form.Item>

      <Form.Item
        label="Rasm havolasi yoki yuklangan rasm"
        name="imageUrl"
        rules={[{ required: true, message: 'Rasm havolasini kiriting yoki rasm yuklang' }]}
      >
        <Input placeholder="https://... yoki rasmni pastdan yuklang" />
      </Form.Item>
      <Form.Item label="Yoki rasm yuklang">
        <Upload beforeUpload={uploadImage} maxCount={1} showUploadList={false} accept="image/*">
          <Button icon={<UploadOutlined />} loading={uploading}>
            {uploading ? 'Yuklanmoqda...' : 'Rasm tanlash'}
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
