import { useEffect, useState } from 'react';
import { Spin, Card, Row, Col, Statistic, Table, Empty } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

import portalRequest from '@/request/portalRequest';

export default function PortalStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await portalRequest.getStatsSummary();
      if (data.success) setStats(data.result);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!stats) return <Empty description="Statistika mavjud emas" />;

  return (
    <div>
      <h2>Statistikam</h2>
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Ishlagan testlar" value={stats.attemptsCount} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Jami savollar" value={stats.totalAnswered} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="To'g'ri javoblar"
              value={stats.totalCorrect}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Noto'g'ri javoblar"
              value={stats.totalIncorrect}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
      {stats.totalPending > 0 && (
        <Card style={{ marginTop: 16 }}>
          <Statistic
            title="Tekshirilishi kutilayotgan javoblar"
            value={stats.totalPending}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      )}

      <h3 style={{ marginTop: 24 }}>Fanlar bo'yicha</h3>
      {stats.bySubject.length === 0 ? (
        <Empty description="Hali ma'lumot yo'q" />
      ) : (
        <Table
          rowKey="subjectId"
          dataSource={stats.bySubject}
          pagination={false}
          columns={[
            { title: 'Fan', dataIndex: 'subjectName', render: (v) => v || 'Nomsiz' },
            { title: "To'g'ri", dataIndex: 'correct' },
            { title: "Noto'g'ri", dataIndex: 'incorrect' },
            { title: 'Kutilmoqda', dataIndex: 'pending' },
          ]}
        />
      )}
    </div>
  );
}
