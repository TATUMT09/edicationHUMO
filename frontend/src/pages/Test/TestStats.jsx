import { useEffect, useState } from 'react';
import { Card, Select, Table, Tag, Empty } from 'antd';

import { request } from '@/request';

export default function TestStats() {
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

  const wrongColor = (percent) => {
    if (percent >= 50) return 'red';
    if (percent >= 25) return 'orange';
    if (percent > 0) return 'gold';
    return 'green';
  };

  const columns = [
    {
      title: 'Savol',
      dataIndex: 'prompt',
    },
    {
      title: 'Javob berganlar',
      dataIndex: 'totalAnswered',
      width: 140,
      align: 'center',
    },
    {
      title: 'Xato soni',
      dataIndex: 'wrongCount',
      width: 110,
      align: 'center',
    },
    {
      title: 'Xato foizi',
      dataIndex: 'wrongPercent',
      width: 120,
      align: 'center',
      render: (percent) => <Tag color={wrongColor(percent)}>{percent}%</Tag>,
    },
  ];

  return (
    <Card title="Savollar statistikasi">
      <Select
        placeholder="Testni tanlang"
        style={{ width: '100%', maxWidth: 420, marginBottom: 16 }}
        loading={isLoadingTests}
        value={selectedTestId}
        onChange={setSelectedTestId}
        options={tests.map((t) => ({ value: t._id, label: t.title }))}
        showSearch
        optionFilterProp="label"
      />
      {selectedTestId ? (
        <Table
          rowKey="questionId"
          columns={columns}
          dataSource={rows}
          loading={isLoadingStats}
          pagination={false}
        />
      ) : (
        <Empty description="Statistikani ko'rish uchun testni tanlang" />
      )}
    </Card>
  );
}
