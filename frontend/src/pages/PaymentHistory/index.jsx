import { useEffect, useState } from 'react';
import { Card, Table, Select, Tag, Space, List } from 'antd';
import dayjs from 'dayjs';

import { request } from '@/request';
import useResponsive from '@/hooks/useResponsive';

export default function PaymentHistory() {
  const { isMobile } = useResponsive();
  const [groups, setGroups] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupFilter, setGroupFilter] = useState(undefined);
  const [statusFilter, setStatusFilter] = useState(undefined);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      request.listAll({ entity: 'group' }),
      request.listAll({ entity: 'monthlypayment' }),
    ]).then(([groupsRes, paymentsRes]) => {
      setGroups(groupsRes.success ? groupsRes.result : []);
      const list = paymentsRes.success ? paymentsRes.result : [];
      list.sort((a, b) => new Date(b.updated) - new Date(a.updated));
      setPayments(list);
      setIsLoading(false);
    });
  }, []);

  const filteredPayments = payments.filter((p) => {
    if (groupFilter && (p.group?._id || p.group) !== groupFilter) return false;
    if (statusFilter === 'paid' && !p.paid) return false;
    if (statusFilter === 'unpaid' && p.paid) return false;
    return true;
  });

  const columns = [
    { title: "O'quvchi", dataIndex: ['student', 'name'] },
    { title: 'Guruh', dataIndex: ['group', 'name'] },
    { title: 'Oy', dataIndex: 'month' },
    {
      title: 'Summa',
      dataIndex: 'amount',
      render: (amount) => `${amount} so'm`,
    },
    {
      title: 'Holat',
      dataIndex: 'paid',
      render: (paid) =>
        paid ? <Tag color="green">To'langan</Tag> : <Tag color="red">To'lanmagan</Tag>,
    },
    {
      title: "To'langan sana",
      dataIndex: 'paidAt',
      render: (paidAt) => (paidAt ? dayjs(paidAt).format('DD.MM.YYYY HH:mm') : '—'),
    },
  ];

  return (
    <Card title="To'lovlar tarixi" bodyStyle={isMobile ? { padding: '12px' } : undefined}>
      <Space wrap style={{ marginBottom: '20px' }} direction={isMobile ? 'vertical' : 'horizontal'}>
        <Select
          placeholder="Guruh bo'yicha filtr"
          allowClear
          style={{ width: isMobile ? '100%' : 220 }}
          value={groupFilter}
          onChange={setGroupFilter}
          options={groups.map((g) => ({ value: g._id, label: g.name }))}
        />
        <Select
          placeholder="Holat bo'yicha filtr"
          allowClear
          style={{ width: isMobile ? '100%' : 220 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'paid', label: "To'langan" },
            { value: 'unpaid', label: "To'lanmagan" },
          ]}
        />
      </Space>

      {isMobile ? (
        <List
          bordered
          loading={isLoading}
          dataSource={filteredPayments}
          pagination={{ pageSize: 20 }}
          renderItem={(p) => (
            <List.Item key={p._id}>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <b>{p.student?.name}</b>
                  {p.paid ? (
                    <Tag color="green">To'langan</Tag>
                  ) : (
                    <Tag color="red">To'lanmagan</Tag>
                  )}
                </div>
                <div>
                  {p.group?.name} — {p.month}
                </div>
                <div>{p.amount} so'm</div>
                {p.paidAt && <div>{dayjs(p.paidAt).format('DD.MM.YYYY HH:mm')}</div>}
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filteredPayments}
          loading={isLoading}
          pagination={{ pageSize: 20 }}
          scroll={{ x: true }}
        />
      )}
    </Card>
  );
}
