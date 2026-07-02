import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Popconfirm,
  message,
  Space,
  List,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import { request } from '@/request';
import useResponsive from '@/hooks/useResponsive';

export default function Parent() {
  const { isMobile } = useResponsive();
  const [parents, setParents] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [form] = Form.useForm();

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      request.listAll({ entity: 'parent' }),
      request.listAll({ entity: 'client' }),
    ]).then(([parentsRes, clientsRes]) => {
      setParents(parentsRes.success ? parentsRes.result : []);
      setClients(clientsRes.success ? clientsRes.result : []);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingParent(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (parent) => {
    setEditingParent(parent);
    form.setFieldsValue({
      name: parent.name,
      phone: parent.phone,
      username: parent.username,
      password: undefined,
      children: (parent.children || []).map((c) => c._id),
    });
    setModalOpen(true);
  };

  const handleDelete = async (parent) => {
    const res = await request.delete({ entity: 'parent', id: parent._id });
    if (res.success) loadData();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setIsSaving(true);

    const res = editingParent
      ? await request.update({ entity: 'parent', id: editingParent._id, jsonData: values })
      : await request.create({ entity: 'parent', jsonData: values });

    setIsSaving(false);
    if (res.success) {
      setModalOpen(false);
      loadData();
    } else {
      message.error(res.message);
    }
  };

  const columns = [
    { title: 'Ism', dataIndex: 'name' },
    { title: 'Telefon', dataIndex: 'phone' },
    { title: 'Login', dataIndex: 'username' },
    {
      title: 'Farzandlar',
      dataIndex: 'children',
      render: (children) => (
        <>
          {(children || []).map((c) => (
            <Tag key={c._id}>{c.name}</Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Botga ulangan',
      dataIndex: 'telegramChatId',
      render: (chatId) =>
        chatId ? <Tag color="green">Ulangan</Tag> : <Tag color="default">Ulanmagan</Tag>,
    },
    {
      title: '',
      key: 'actions',
      render: (_, parent) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEditModal(parent)} />
          <Popconfirm
            title="O'chirishni tasdiqlaysizmi?"
            onConfirm={() => handleDelete(parent)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Ota-onalar"
      bodyStyle={isMobile ? { padding: '12px' } : undefined}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} block={isMobile}>
          Yangi qo'shish
        </Button>
      }
    >
      {isMobile ? (
        <List
          bordered
          loading={isLoading}
          dataSource={parents}
          renderItem={(parent) => (
            <List.Item
              key={parent._id}
              actions={[
                <Button
                  key="edit"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => openEditModal(parent)}
                />,
                <Popconfirm
                  key="delete"
                  title="O'chirishni tasdiqlaysizmi?"
                  onConfirm={() => handleDelete(parent)}
                  okText="Ha"
                  cancelText="Yo'q"
                >
                  <Button icon={<DeleteOutlined />} size="small" danger />
                </Popconfirm>,
              ]}
            >
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <b>{parent.name}</b>
                  {parent.telegramChatId ? (
                    <Tag color="green">Ulangan</Tag>
                  ) : (
                    <Tag color="default">Ulanmagan</Tag>
                  )}
                </div>
                <div>{parent.phone}</div>
                <div>Login: {parent.username}</div>
                <div style={{ marginTop: '4px' }}>
                  {(parent.children || []).map((c) => (
                    <Tag key={c._id}>{c.name}</Tag>
                  ))}
                </div>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={parents}
          loading={isLoading}
          pagination={false}
          scroll={{ x: true }}
        />
      )}

      <Modal
        title={editingParent ? "Ota-onani tahrirlash" : "Yangi ota-ona qo'shish"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={isSaving}
        okText="Saqlash"
        cancelText="Bekor qilish"
        width={isMobile ? '92%' : 520}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Ism" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Telefon">
            <Input placeholder="+998 xx xxx xx xx" />
          </Form.Item>
          <Form.Item name="username" label="Login (foydalanuvchi nomi)" rules={[{ required: true }]}>
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="password"
            label={editingParent ? "Parol (o'zgartirish uchun to'ldiring)" : 'Parol'}
            rules={[{ required: !editingParent }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="children" label="Farzandlari">
            <Select
              mode="multiple"
              placeholder="O'quvchilarni tanlang"
              options={clients.map((c) => ({ value: c._id, label: c.name }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
