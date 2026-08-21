import { useEffect, useState } from 'react';
import { Spin, Table, Tag, Empty } from 'antd';

import portalRequest from '@/request/portalRequest';

const REASON_LABELS = {
  test_completed: 'Test yakunlandi',
  perfect_score_bonus: 'Mukammal natija bonusi',
  admin_adjustment: 'Administrator tomonidan',
};

export default function PortalStarHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await portalRequest.getStarsHistory();
      if (data.success) setTransactions(data.result);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  return (
    <div>
      <h2>⭐ Yulduzlar tarixi</h2>
      {transactions.length === 0 ? (
        <Empty description="Hali yulduz tarixi yo'q" />
      ) : (
        <Table
          rowKey="_id"
          dataSource={transactions}
          pagination={{ pageSize: 20 }}
          columns={[
            {
              title: 'Sana',
              dataIndex: 'created',
              render: (v) => new Date(v).toLocaleString(),
            },
            {
              title: 'Sabab',
              dataIndex: 'reason',
              render: (v) => REASON_LABELS[v] || v,
            },
            {
              title: 'Miqdor',
              dataIndex: 'amount',
              align: 'right',
              render: (v) => (
                <Tag color={v >= 0 ? 'green' : 'red'} style={{ fontSize: 14 }}>
                  {v >= 0 ? '+' : ''}
                  {v} ⭐
                </Tag>
              ),
            },
            {
              title: 'Balans',
              dataIndex: 'balanceAfter',
              align: 'right',
            },
          ]}
        />
      )}
    </div>
  );
}
