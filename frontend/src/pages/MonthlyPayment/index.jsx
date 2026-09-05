import { useEffect, useState } from 'react';
import {
  Select,
  DatePicker,
  Table,
  Button,
  Card,
  message,
  Empty,
  Tag,
  InputNumber,
  List,
  Space,
} from 'antd';
import { SaveOutlined, SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { request } from '@/request';
import useResponsive from '@/hooks/useResponsive';
import useLastSelectedGroup from '@/hooks/useLastSelectedGroup';

function formatSom(value) {
  return `${(value || 0).toLocaleString('ru-RU')} so'm`;
}

// Defined outside MonthlyPayment so their identity is stable across renders —
// keeping them as inline closures inside the component caused React to
// remount the <InputNumber> on every keystroke, kicking focus out after each digit.
function AmountInput({ studentId, amount, onChange, isMobile }) {
  return (
    <InputNumber
      min={0}
      value={amount}
      onChange={(value) => onChange(studentId, value)}
      style={{ width: isMobile ? '100%' : 140 }}
      addonAfter="so'm"
    />
  );
}

function PaidAmountInput({ studentId, amount, paidAmount, onChange, isMobile }) {
  return (
    <InputNumber
      min={0}
      max={amount}
      value={paidAmount}
      onChange={(value) => onChange(studentId, value || 0)}
      style={{ width: isMobile ? '100%' : 140 }}
      addonAfter="so'm"
    />
  );
}

function StatusTag({ amount, paidAmount }) {
  const remaining = (amount || 0) - (paidAmount || 0);
  if (remaining <= 0) return <Tag color="green">To'langan</Tag>;
  if (paidAmount > 0) return <Tag color="orange">Qarz: {formatSom(remaining)}</Tag>;
  return <Tag color="red">To'lanmagan</Tag>;
}

export default function MonthlyPayment() {
  const { isMobile } = useResponsive();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useLastSelectedGroup(groups);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [students, setStudents] = useState([]);
  const [amountMap, setAmountMap] = useState({});
  const [paidAmountMap, setPaidAmountMap] = useState({});
  const [originalAmountMap, setOriginalAmountMap] = useState({});
  const [originalPaidAmountMap, setOriginalPaidAmountMap] = useState({});
  const [recordIdMap, setRecordIdMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  useEffect(() => {
    request.listAll({ entity: 'group' }).then((res) => {
      if (res.success) setGroups(res.result);
    });
  }, []);

  const currentGroup = groups.find((g) => g._id === selectedGroup);

  useEffect(() => {
    if (!selectedGroup) {
      setStudents([]);
      return;
    }
    setIsLoading(true);
    Promise.all([
      request.filter({ entity: 'client', options: { filter: 'group', equal: selectedGroup } }),
      request.filter({ entity: 'monthlypayment', options: { filter: 'group', equal: selectedGroup } }),
    ]).then(([studentsRes, paymentsRes]) => {
      const studentList = studentsRes.success ? studentsRes.result : [];
      setStudents(studentList);

      const monthStr = selectedMonth.format('YYYY-MM');
      const newAmountMap = {};
      const newPaidAmountMap = {};
      const newRecordIdMap = {};
      const defaultFee = currentGroup?.monthlyFee || 0;

      studentList.forEach((student) => {
        newAmountMap[student._id] = defaultFee;
        newPaidAmountMap[student._id] = 0;
      });

      (paymentsRes.success ? paymentsRes.result : [])
        .filter((rec) => rec.month === monthStr)
        .forEach((rec) => {
          const studentId = rec.student?._id || rec.student;
          newAmountMap[studentId] = rec.amount;
          newPaidAmountMap[studentId] = rec.paidAmount || 0;
          newRecordIdMap[studentId] = rec._id;
        });

      setAmountMap(newAmountMap);
      setPaidAmountMap(newPaidAmountMap);
      setOriginalAmountMap(newAmountMap);
      setOriginalPaidAmountMap(newPaidAmountMap);
      setRecordIdMap(newRecordIdMap);
      setIsLoading(false);
    });
  }, [selectedGroup, selectedMonth]);

  const setAmount = (studentId, value) => {
    setAmountMap((prev) => ({ ...prev, [studentId]: value }));
  };

  const setPaidAmount = (studentId, value) => {
    setPaidAmountMap((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSave = async () => {
    if (!selectedGroup) return;
    setIsSaving(true);
    const monthStr = selectedMonth.format('YYYY-MM');

    // Only touch students whose amount or paid amount actually changed —
    // avoids creating/updating records for every student on every save.
    const changedStudents = students.filter(
      (student) =>
        amountMap[student._id] !== originalAmountMap[student._id] ||
        paidAmountMap[student._id] !== originalPaidAmountMap[student._id]
    );

    await Promise.all(
      changedStudents.map((student) => {
        const amount = amountMap[student._id] || 0;
        const paidAmount = paidAmountMap[student._id] || 0;
        const existingId = recordIdMap[student._id];
        const jsonData = { amount, paidAmount };
        if (existingId) {
          return request.update({ entity: 'monthlypayment', id: existingId, jsonData });
        }
        return request.create({
          entity: 'monthlypayment',
          jsonData: { student: student._id, group: selectedGroup, month: monthStr, ...jsonData },
        });
      })
    );

    setOriginalAmountMap(amountMap);
    setOriginalPaidAmountMap(paidAmountMap);
    setIsSaving(false);
    message.success(changedStudents.length > 0 ? "To'lovlar saqlandi" : "O'zgarish yo'q edi");
  };

  const handleSendReminder = async () => {
    setIsSendingReminder(true);
    const res = await request.post({ entity: 'notify/unpaid-reminder', jsonData: {} });
    setIsSendingReminder(false);
    if (res.success) {
      message.success(res.message);
    }
  };

  const remainingOf = (studentId) =>
    (amountMap[studentId] || 0) - (paidAmountMap[studentId] || 0);

  const paidCount = students.filter((s) => remainingOf(s._id) <= 0).length;
  const partialCount = students.filter(
    (s) => remainingOf(s._id) > 0 && (paidAmountMap[s._id] || 0) > 0
  ).length;

  const columns = [
    {
      title: "O'quvchi",
      dataIndex: 'name',
    },
    {
      title: 'Jami summa',
      dataIndex: '_id',
      render: (_, student) => (
        <AmountInput
          studentId={student._id}
          amount={amountMap[student._id]}
          onChange={setAmount}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "To'langan summa",
      dataIndex: '_id',
      render: (_, student) => (
        <PaidAmountInput
          studentId={student._id}
          amount={amountMap[student._id]}
          paidAmount={paidAmountMap[student._id]}
          onChange={setPaidAmount}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: 'Holat',
      dataIndex: '_id',
      render: (_, student) => (
        <StatusTag amount={amountMap[student._id]} paidAmount={paidAmountMap[student._id]} />
      ),
    },
  ];

  return (
    <Card title="Oylik to'lovlar" styles={{ body: isMobile ? { padding: '12px' } : undefined }}>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <Select
          placeholder="Guruhni tanlang"
          size="large"
          style={{ width: isMobile ? '100%' : 240 }}
          value={selectedGroup}
          onChange={setSelectedGroup}
          options={groups.map((g) => ({ value: g._id, label: g.name }))}
        />
        <DatePicker
          size="large"
          picker="month"
          value={selectedMonth}
          onChange={(date) => date && setSelectedMonth(date)}
          allowClear={false}
          style={isMobile ? { width: '100%' } : undefined}
        />
        {selectedGroup && students.length > 0 && (
          <>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={isSaving}
              block={isMobile}
            >
              Saqlash
            </Button>
            <Button
              size="large"
              icon={<SendOutlined />}
              onClick={handleSendReminder}
              loading={isSendingReminder}
              block={isMobile}
            >
              Eslatma yuborish
            </Button>
            <Space wrap>
              <Tag color="green" style={{ fontSize: '14px', padding: '4px 10px' }}>
                To'langan: {paidCount}
              </Tag>
              <Tag color="orange" style={{ fontSize: '14px', padding: '4px 10px' }}>
                Qisman: {partialCount}
              </Tag>
              <Tag color="red" style={{ fontSize: '14px', padding: '4px 10px' }}>
                To'lanmagan: {students.length - paidCount - partialCount}
              </Tag>
            </Space>
          </>
        )}
      </div>

      {!selectedGroup ? (
        <Empty description="Guruhni tanlang" />
      ) : isMobile ? (
        <List
          bordered
          loading={isLoading}
          dataSource={students}
          renderItem={(student) => (
            <List.Item key={student._id}>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b>{student.name}</b>
                  <StatusTag amount={amountMap[student._id]} paidAmount={paidAmountMap[student._id]} />
                </div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999' }}>Jami summa</div>
                    <AmountInput
                      studentId={student._id}
                      amount={amountMap[student._id]}
                      onChange={setAmount}
                      isMobile={isMobile}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999' }}>To'langan summa</div>
                    <PaidAmountInput
                      studentId={student._id}
                      amount={amountMap[student._id]}
                      paidAmount={paidAmountMap[student._id]}
                      onChange={setPaidAmount}
                      isMobile={isMobile}
                    />
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={students}
          loading={isLoading}
          pagination={false}
          scroll={{ x: true }}
        />
      )}
    </Card>
  );
}
