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

const ROLE_LABELS = {
  owner: 'Administrator',
  teacher: "O'qituvchi",
};

export default function Staff() {
  const { isMobile } = useResponsive();
  const [staff, setStaff] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      request.list({ entity: 'staff' }),
      request.listAll({ entity: 'group' }),
    ]).then(([staffRes, groupsRes]) => {
      setStaff(staffRes.success ? staffRes.result : []);
      setGroups(groupsRes.success ? groupsRes.result : []);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const groupTaughtBy = (adminId) => groups.find((g) => (g.teacher?._id || g.teacher) === adminId);

  const openCreateModal = () => {
    setEditingStaff(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (person) => {
    setEditingStaff(person);
    form.setFieldsValue({
      name: person.name,
      email: person.email,
      role: person.role,
      password: undefined,
    });
    setModalOpen(true);
  };

  const handleDelete = async (person) => {
    const res = await request.delete({ entity: 'staff', id: person._id });
    if (res.success) loadData();
    else message.error(res.message);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setIsSaving(true);

    const res = editingStaff
      ? await request.update({ entity: 'staff', id: editingStaff._id, jsonData: values })
      : await request.create({ entity: 'staff', jsonData: values });

    setIsSaving(false);
    if (res.success) {
      setModalOpen(false);
      loadData();
    } else {
      message.error(res.message);
    }
  };

  const RoleTag = ({ person }) => {
    const taughtGroup = groupTaughtBy(person._id);
    return (
      <>
        <Tag color={person.role === 'owner' ? 'gold' : 'blue'}>{ROLE_LABELS[person.role]}</Tag>
        {taughtGroup && <Tag color="green">{taughtGroup.name}</Tag>}
      </>
    );
  };

  const filteredStaff = staff.filter((s) => {
    const q = searchText.trim().toLowerCase();
    if (!q) return true;
    return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
  });

  const columns = [
    { title: 'Ism', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Rol / Guruh',
      key: 'role',
      render: (_, person) => <RoleTag person={person} />,
    },
    {
      title: '',
      key: 'actions',
      render: (_, person) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEditModal(person)} />
          <Popconfirm
            title="O'chirishni tasdiqlaysizmi?"
            onConfirm={() => handleDelete(person)}
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
      title="Xodimlar"
      styles={{ body: isMobile ? { padding: '12px' } : undefined }}
      extra={
        !isMobile && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Yangi qo'shish
          </Button>
        )
      }
    >
      {isMobile && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
          block
          style={{ marginBottom: '12px' }}
        >
          Yangi qo'shish
        </Button>
      )}
      <Input
        placeholder="Ism yoki email bo'yicha qidirish"
        allowClear
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: '12px' }}
      />
      {isMobile ? (
        <List
          bordered
          loading={isLoading}
          dataSource={filteredStaff}
          pagination={{ pageSize: 15, size: 'small' }}
          renderItem={(person) => (
            <List.Item key={person._id} style={{ padding: '8px 12px' }}>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  title={`${person.name} — ${person.email}`}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <b>{person.name}</b>
                  <span style={{ color: '#999' }}> · {person.email}</span>
                </span>
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => openEditModal(person)}
                />
                <Popconfirm
                  title="O'chirishni tasdiqlaysizmi?"
                  onConfirm={() => handleDelete(person)}
                  okText="Ha"
                  cancelText="Yo'q"
                >
                  <Button icon={<DeleteOutlined />} size="small" danger />
                </Popconfirm>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filteredStaff}
          loading={isLoading}
          pagination={{ pageSize: 20 }}
          scroll={{ x: true }}
        />
      )}

      <Modal
        title={editingStaff ? 'Xodimni tahrirlash' : "Yangi xodim qo'shish"}
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
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input autoComplete="off" disabled={!!editingStaff} />
          </Form.Item>
          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true }]}
            initialValue="teacher"
          >
            <Select
              options={[
                { value: 'teacher', label: "O'qituvchi (faqat o'z guruhini boshqaradi)" },
                { value: 'owner', label: 'Administrator (hammasini boshqaradi)' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={editingStaff ? "Parol (o'zgartirish uchun to'ldiring)" : 'Parol'}
            rules={[{ required: !editingStaff }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
