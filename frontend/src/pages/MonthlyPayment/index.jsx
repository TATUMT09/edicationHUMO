import { useEffect, useState } from 'react';
import {
  Select,
  DatePicker,
  Table,
  Switch,
  Button,
  Card,
  message,
  Empty,
  Tag,
  InputNumber,
  List,
  Space,
} from 'antd';
import { SaveOutlined, CheckOutlined, CloseOutlined, SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { request } from '@/request';
import useResponsive from '@/hooks/useResponsive';

export default function MonthlyPayment() {
  const { isMobile } = useResponsive();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(undefined);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [students, setStudents] = useState([]);
  const [paidMap, setPaidMap] = useState({});
  const [amountMap, setAmountMap] = useState({});
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
      const newPaidMap = {};
      const newAmountMap = {};
      const newRecordIdMap = {};
      const defaultFee = currentGroup?.monthlyFee || 0;

      studentList.forEach((student) => {
        newAmountMap[student._id] = defaultFee;
        newPaidMap[student._id] = false;
      });

      (paymentsRes.success ? paymentsRes.result : [])
        .filter((rec) => rec.month === monthStr)
        .forEach((rec) => {
          const studentId = rec.student?._id || rec.student;
          newPaidMap[studentId] = rec.paid;
          newAmountMap[studentId] = rec.amount;
          newRecordIdMap[studentId] = rec._id;
        });

      setPaidMap(newPaidMap);
      setAmountMap(newAmountMap);
      setRecordIdMap(newRecordIdMap);
      setIsLoading(false);
    });
  }, [selectedGroup, selectedMonth]);

  const togglePaid = (studentId) => {
    setPaidMap((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const setAmount = (studentId, value) => {
    setAmountMap((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSave = async () => {
    if (!selectedGroup) return;
    setIsSaving(true);
    const monthStr = selectedMonth.format('YYYY-MM');

    await Promise.all(
      students.map((student) => {
        const paid = paidMap[student._id] || false;
        const amount = amountMap[student._id] || 0;
        const existingId = recordIdMap[student._id];
        const jsonData = { amount, paid, paidAt: paid ? new Date() : null };
        if (existingId) {
          return request.update({ entity: 'monthlypayment', id: existingId, jsonData });
        }
        return request.create({
          entity: 'monthlypayment',
          jsonData: { student: student._id, group: selectedGroup, month: monthStr, ...jsonData },
        });
      })
    );

    setIsSaving(false);
    message.success("To'lovlar saqlandi");
  };

  const handleSendReminder = async () => {
    setIsSendingReminder(true);
    const res = await request.post({ entity: 'notify/unpaid-reminder', jsonData: {} });
    setIsSendingReminder(false);
    if (res.success) {
      message.success(res.message);
    }
  };

  const paidCount = students.filter((s) => paidMap[s._id]).length;

  const AmountInput = ({ student }) => (
    <InputNumber
      min={0}
      value={amountMap[student._id]}
      onChange={(value) => setAmount(student._id, value)}
      style={{ width: isMobile ? '100%' : 160 }}
      addonAfter="so'm"
    />
  );

  const PaidSwitch = ({ student }) => (
    <Switch
      checked={!!paidMap[student._id]}
      checkedChildren={<CheckOutlined />}
      unCheckedChildren={<CloseOutlined />}
      onChange={() => togglePaid(student._id)}
    />
  );

  const columns = [
    {
      title: "O'quvchi",
      dataIndex: 'name',
    },
    {
      title: 'Summa',
      dataIndex: '_id',
      render: (_, student) => <AmountInput student={student} />,
    },
    {
      title: "To'lov holati",
      dataIndex: 'paid',
      render: (_, student) => <PaidSwitch student={student} />,
    },
  ];

  return (
    <Card title="Oylik to'lovlar" bodyStyle={isMobile ? { padding: '12px' } : undefined}>
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
          style={{ width: isMobile ? '100%' : 240 }}
          value={selectedGroup}
          onChange={setSelectedGroup}
          options={groups.map((g) => ({ value: g._id, label: g.name }))}
        />
        <DatePicker
          picker="month"
          value={selectedMonth}
          onChange={(date) => date && setSelectedMonth(date)}
          allowClear={false}
          style={isMobile ? { width: '100%' } : undefined}
        />
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={isSaving}
          disabled={!selectedGroup || students.length === 0}
          block={isMobile}
        >
          Saqlash
        </Button>
        <Button
          icon={<SendOutlined />}
          onClick={handleSendReminder}
          loading={isSendingReminder}
          block={isMobile}
        >
          Eslatma yuborish
        </Button>
        {selectedGroup && students.length > 0 && (
          <Space wrap>
            <Tag color="green" style={{ fontSize: '14px', padding: '4px 10px' }}>
              To'lagan: {paidCount}
            </Tag>
            <Tag color="red" style={{ fontSize: '14px', padding: '4px 10px' }}>
              To'lamagan: {students.length - paidCount}
            </Tag>
          </Space>
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
                  <PaidSwitch student={student} />
                </div>
                <div style={{ marginTop: '8px' }}>
                  <AmountInput student={student} />
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
