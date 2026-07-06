import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, message, List } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ScheduleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { request } from '@/request';
import useResponsive from '@/hooks/useResponsive';

export default function Dashboard() {
  const { isMobile } = useResponsive();
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [attendanceToday, setAttendanceToday] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  useEffect(() => {
    Promise.all([
      request.listAll({ entity: 'group' }),
      request.listAll({ entity: 'client' }),
      request.listAll({ entity: 'monthlypayment' }),
      request.listAll({ entity: 'attendance' }),
    ]).then(([groupsRes, studentsRes, paymentsRes, attendanceRes]) => {
      setGroups(groupsRes.success ? groupsRes.result : []);
      setStudents(studentsRes.success ? studentsRes.result : []);
      setPayments(paymentsRes.success ? paymentsRes.result : []);

      const todayStr = dayjs().format('YYYY-MM-DD');
      const todaysRecords = (attendanceRes.success ? attendanceRes.result : []).filter(
        (rec) => rec.date === todayStr
      );
      setAttendanceToday(todaysRecords);
      setIsLoading(false);
    });
  }, []);

  const currentMonth = dayjs().format('YYYY-MM');
  const currentMonthPayments = payments.filter((p) => p.month === currentMonth);
  const paymentByStudentId = new Map(
    currentMonthPayments.map((p) => [p.student?._id || p.student, p])
  );

  const remainingOf = (student) => {
    const payment = paymentByStudentId.get(student._id);
    const groupFee =
      groups.find((g) => g._id === (student.group?._id || student.group))?.monthlyFee || 0;
    const amount = payment ? payment.amount : groupFee;
    const paidAmount = payment ? payment.paidAmount || 0 : 0;
    return amount - paidAmount;
  };

  const totalStudents = students.length;
  const paidCount = students.filter((s) => remainingOf(s) <= 0).length;
  const partialCount = students.filter((s) => {
    const payment = paymentByStudentId.get(s._id);
    return remainingOf(s) > 0 && (payment?.paidAmount || 0) > 0;
  }).length;
  const unpaidCount = totalStudents - paidCount - partialCount;
  const totalDebt = students.reduce((sum, s) => sum + Math.max(remainingOf(s), 0), 0);
  const presentToday = attendanceToday.filter((rec) => rec.status === 'present').length;
  const absentToday = attendanceToday.filter((rec) => rec.status === 'absent').length;

  const groupRows = groups.map((group) => {
    const groupStudents = students.filter((s) => (s.group?._id || s.group) === group._id);
    const groupPaid = groupStudents.filter((s) => remainingOf(s) <= 0).length;
    const groupPartial = groupStudents.filter((s) => {
      const payment = paymentByStudentId.get(s._id);
      return remainingOf(s) > 0 && (payment?.paidAmount || 0) > 0;
    }).length;
    return {
      key: group._id,
      name: group.name,
      monthlyFee: group.monthlyFee,
      studentCount: groupStudents.length,
      paid: groupPaid,
      partial: groupPartial,
      unpaid: groupStudents.length - groupPaid - groupPartial,
    };
  });

  const columns = [
    { title: 'Guruh', dataIndex: 'name' },
    { title: "O'quvchilar soni", dataIndex: 'studentCount' },
    {
      title: "Bu oy to'lagan",
      dataIndex: 'paid',
      render: (value) => <Tag color="green">{value}</Tag>,
    },
    {
      title: 'Qisman to\'lagan',
      dataIndex: 'partial',
      render: (value) => <Tag color="orange">{value}</Tag>,
    },
    {
      title: "Bu oy to'lamagan",
      dataIndex: 'unpaid',
      render: (value) => <Tag color="red">{value}</Tag>,
    },
  ];

  const cardStyle = { textAlign: 'center' };

  const sendUnpaidReminder = async () => {
    setIsSendingReminder(true);
    const res = await request.post({ entity: 'notify/unpaid-reminder', jsonData: {} });
    setIsSendingReminder(false);
    if (res.success) {
      message.success(res.message);
    }
  };

  return (
    <div>
      <Space wrap style={{ marginBottom: '20px' }}>
        <Button
          icon={<SendOutlined />}
          onClick={sendUnpaidReminder}
          loading={isSendingReminder}
        >
          To'lov eslatmasini botga yuborish
        </Button>
      </Space>

      <Row gutter={[16, 16]}>
        <Col xs={12} md={8} lg={4}>
          <Card style={cardStyle} loading={isLoading}>
            <Statistic
              title="Jami o'quvchilar"
              value={totalStudents}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={8} lg={4}>
          <Card style={cardStyle} loading={isLoading}>
            <Statistic title="Guruhlar" value={groups.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={8} lg={4}>
          <Card style={cardStyle} loading={isLoading}>
            <Statistic
              title="Bu oy to'lagan"
              value={paidCount}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={8} lg={4}>
          <Card style={cardStyle} loading={isLoading}>
            <Statistic
              title="Qisman to'lagan"
              value={partialCount}
              valueStyle={{ color: '#d48806' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={8} lg={4}>
          <Card style={cardStyle} loading={isLoading}>
            <Statistic
              title="Bu oy to'lamagan"
              value={unpaidCount}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={8} lg={4}>
          <Card style={cardStyle} loading={isLoading}>
            <Statistic
              title="Jami qarzdorlik"
              value={totalDebt}
              valueStyle={{ color: '#cf1322' }}
              suffix="so'm"
            />
          </Card>
        </Col>
        <Col xs={12} md={8} lg={4}>
          <Card style={cardStyle} loading={isLoading}>
            <Statistic
              title="Bugun kelgan"
              value={presentToday}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ScheduleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={8} lg={4}>
          <Card style={cardStyle} loading={isLoading}>
            <Statistic
              title="Bugun kelmagan"
              value={absentToday}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ScheduleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Guruhlar bo'yicha" style={{ marginTop: '20px' }}>
        {isMobile ? (
          <List
            bordered
            loading={isLoading}
            dataSource={groupRows}
            renderItem={(row) => (
              <List.Item key={row.key}>
                <div style={{ width: '100%' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <b>{row.name}</b>
                    <span style={{ color: '#999', fontSize: '13px' }}>
                      {row.studentCount} o'quvchi
                    </span>
                  </div>
                  <Space wrap style={{ marginTop: '6px' }}>
                    <Tag color="green">To'langan: {row.paid}</Tag>
                    <Tag color="orange">Qisman: {row.partial}</Tag>
                    <Tag color="red">To'lamagan: {row.unpaid}</Tag>
                  </Space>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Table
            rowKey="key"
            columns={columns}
            dataSource={groupRows}
            loading={isLoading}
            pagination={false}
            scroll={{ x: true }}
          />
        )}
      </Card>
    </div>
  );
}
