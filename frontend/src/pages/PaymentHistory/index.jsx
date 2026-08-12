import { useEffect, useState } from 'react';
import { Card, Table, Select, Tag, Space, List } from 'antd';
import dayjs from 'dayjs';

import { request } from '@/request';
import useResponsive from '@/hooks/useResponsive';

function formatSom(value) {
  return `${(value || 0).toLocaleString('ru-RU')} so'm`;
}

function paymentStatus(p) {
  const remaining = (p.amount || 0) - (p.paidAmount || 0);
  if (remaining <= 0) return { key: 'paid', label: "To'langan", color: 'green' };
  if ((p.paidAmount || 0) > 0)
    return { key: 'partial', label: `Qarz: ${formatSom(remaining)}`, color: 'orange' };
  return { key: 'unpaid', label: "To'lanmagan", color: 'red' };
}

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
      request.listAll({ entity: 'client' }),
    ]).then(([groupsRes, paymentsRes, studentsRes]) => {
      const groupList = groupsRes.success ? groupsRes.result : [];
      const students = studentsRes.success ? studentsRes.result : [];
      setGroups(groupList);

      const list = paymentsRes.success ? paymentsRes.result : [];

      // A student with no MonthlyPayment record yet for the current month is
      // still "unpaid" (this mirrors the Dashboard/Oylik-to'lovlar default) —
      // without a synthetic row here, "To'lanmagan" filtered to 0 results for
      // any group nobody has been charged yet, even though the app treats
      // them as owing money everywhere else.
      const currentMonth = dayjs().format('YYYY-MM');
      const hasCurrentRecord = new Set(
        list.filter((p) => p.month === currentMonth).map((p) => p.student?._id || p.student)
      );
      const groupById = new Map(groupList.map((g) => [g._id, g]));
      const virtualUnpaid = students
        .filter((s) => !hasCurrentRecord.has(s._id))
        .map((s) => ({
          _id: `virtual-${s._id}`,
          student: s,
          group: s.group,
          month: currentMonth,
          amount: groupById.get(s.group?._id || s.group)?.monthlyFee || 0,
          paidAmount: 0,
          paidAt: null,
        }));

      const combined = [...list, ...virtualUnpaid];
      combined.sort((a, b) => new Date(b.updated || 0) - new Date(a.updated || 0));
      setPayments(combined);
      setIsLoading(false);
    });
  }, []);

  const filteredPayments = payments.filter((p) => {
    if (groupFilter && (p.group?._id || p.group) !== groupFilter) return false;
    if (statusFilter && paymentStatus(p).key !== statusFilter) return false;
    return true;
  });

  const columns = [
    { title: "O'quvchi", dataIndex: ['student', 'name'] },
    { title: 'Guruh', dataIndex: ['group', 'name'] },
    { title: 'Oy', dataIndex: 'month' },
    {
      title: 'Jami summa',
      dataIndex: 'amount',
      render: (amount) => formatSom(amount),
    },
    {
      title: "To'langan summa",
      dataIndex: 'paidAmount',
      render: (paidAmount) => formatSom(paidAmount),
    },
    {
      title: 'Holat',
      key: 'status',
      render: (_, p) => {
        const status = paymentStatus(p);
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: "So'nggi to'lov sanasi",
      dataIndex: 'paidAt',
      render: (paidAt) => (paidAt ? dayjs(paidAt).format('DD.MM.YYYY HH:mm') : '—'),
    },
  ];

  return (
    <Card title="To'lovlar tarixi" styles={{ body: isMobile ? { padding: '12px' } : undefined }}>
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
            { value: 'partial', label: 'Qisman to\'langan' },
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
          renderItem={(p) => {
            const status = paymentStatus(p);
            return (
              <List.Item key={p._id}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <b>{p.student?.name}</b>
                    <Tag color={status.color}>{status.label}</Tag>
                  </div>
                  <div>
                    {p.group?.name} — {p.month}
                  </div>
                  <div>
                    {formatSom(p.paidAmount)} / {formatSom(p.amount)}
                  </div>
                  {p.paidAt && <div>{dayjs(p.paidAt).format('DD.MM.YYYY HH:mm')}</div>}
                </div>
              </List.Item>
            );
          }}
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
