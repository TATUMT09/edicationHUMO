import { useEffect, useState } from 'react';
import { Card, Select, Table, Progress, Empty, List, Statistic, Row, Col } from 'antd';
import { WarningOutlined } from '@ant-design/icons';

import { request } from '@/request';
import useResponsive from '@/hooks/useResponsive';

function severityColor(percent) {
  if (percent >= 50) return '#cf1322';
  if (percent >= 25) return '#fa8c16';
  if (percent > 0) return '#d4b106';
  return '#389e0d';
}

function RankBadge({ index }) {
  const colors = ['#cf1322', '#fa8c16', '#d4b106'];
  const color = colors[index] || '#8c8c8c';
  return (
    <div
      style={{
        width: 28,
        height: 28,
        minWidth: 28,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: 13,
      }}
    >
      {index + 1}
    </div>
  );
}

export default function TestStats() {
  const { isMobile } = useResponsive();
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState(undefined);
  const [rows, setRows] = useState([]);
  const [isLoadingTests, setIsLoadingTests] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    request.listAll({ entity: 'test' }).then((res) => {
      setTests(res.success ? res.result : []);
      setIsLoadingTests(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedTestId) {
      setRows([]);
      return;
    }
    setIsLoadingStats(true);
    request.get({ entity: `test/stats/${selectedTestId}` }).then((res) => {
      setRows(res.success ? res.result : []);
      setIsLoadingStats(false);
    });
  }, [selectedTestId]);

  const answeredRows = rows.filter((r) => r.totalAnswered > 0);
  const avgWrongPercent = answeredRows.length
    ? Math.round(answeredRows.reduce((sum, r) => sum + r.wrongPercent, 0) / answeredRows.length)
    : 0;
  const hardestQuestion = answeredRows[0];

  const columns = [
    {
      title: '#',
      key: 'rank',
      width: 48,
      align: 'center',
      render: (_, __, index) => <RankBadge index={index} />,
    },
    {
      title: 'Savol',
      dataIndex: 'prompt',
      ellipsis: true,
    },
    {
      title: 'Javob berganlar',
      dataIndex: 'totalAnswered',
      width: 130,
      align: 'center',
    },
    {
      title: 'Xato',
      key: 'wrong',
      width: 220,
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress
            percent={r.wrongPercent}
            size="small"
            strokeColor={severityColor(r.wrongPercent)}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 12, color: '#8c8c8c', minWidth: 46 }}>
            {r.wrongCount}/{r.totalAnswered}
          </span>
        </div>
      ),
    },
  ];

  return (
    <Card title="Savollar statistikasi">
      <Select
        placeholder="Testni tanlang"
        size="large"
        style={{ width: '100%', maxWidth: 420, marginBottom: 20 }}
        loading={isLoadingTests}
        value={selectedTestId}
        onChange={setSelectedTestId}
        options={tests.map((t) => ({ value: t._id, label: t.title }))}
        showSearch
        optionFilterProp="label"
      />

      {!selectedTestId ? (
        <Empty description="Statistikani ko'rish uchun testni tanlang" />
      ) : !isLoadingStats && answeredRows.length === 0 ? (
        <Empty description="Bu testni hali hech kim ishlamagan" />
      ) : (
        <>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={12}>
              <Card size="small" style={{ background: '#fafafa' }}>
                <Statistic title="Javob berilgan savollar" value={answeredRows.length} suffix={`/ ${rows.length}`} />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" style={{ background: '#fafafa' }}>
                <Statistic
                  title="O'rtacha xato foizi"
                  value={avgWrongPercent}
                  suffix="%"
                  valueStyle={{ color: severityColor(avgWrongPercent) }}
                />
              </Card>
            </Col>
          </Row>

          {hardestQuestion && hardestQuestion.wrongPercent > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                background: '#fff2e8',
                border: '1px solid #ffd8bf',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 20,
              }}
            >
              <WarningOutlined style={{ color: '#fa8c16', marginTop: 3 }} />
              <div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Eng ko'p xato qilingan savol</div>
                <div style={{ fontWeight: 600 }}>{hardestQuestion.prompt}</div>
              </div>
            </div>
          )}

          {isMobile ? (
            <List
              loading={isLoadingStats}
              dataSource={rows}
              renderItem={(r, index) => (
                <List.Item style={{ padding: 0, marginBottom: 12 }}>
                  <div
                    style={{
                      width: '100%',
                      border: '1px solid #f0f0f0',
                      borderRadius: 10,
                      padding: 14,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <RankBadge index={index} />
                      <div style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{r.prompt}</div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <Progress percent={r.wrongPercent} strokeColor={severityColor(r.wrongPercent)} />
                      <div style={{ fontSize: 12, color: '#8c8c8c', textAlign: 'right' }}>
                        {r.totalAnswered === 0
                          ? "hali javob yo'q"
                          : `${r.wrongCount}/${r.totalAnswered} noto'g'ri javob berdi`}
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <Table
              rowKey="questionId"
              columns={columns}
              dataSource={rows}
              loading={isLoadingStats}
              pagination={false}
            />
          )}
        </>
      )}
    </Card>
  );
}
