import { useEffect, useState } from 'react';
import { Table, Spin, Empty, Tag } from 'antd';

import portalRequest from '@/request/portalRequest';

const STATUS_LABELS = {
  pending: { text: 'Kutilmoqda', color: 'gold' },
  approved: { text: 'Tasdiqlandi', color: 'blue' },
  preparing: { text: 'Tayyorlanmoqda', color: 'purple' },
  delivered: { text: 'Yetkazildi', color: 'green' },
  cancelled: { text: 'Bekor qilindi', color: 'red' },
};

export default function PortalMyRewardOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await portalRequest.getMyRewardOrders();
      if (data.success) setOrders(data.result);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  return (
    <div>
      <h2>📦 Mening buyurtmalarim</h2>
      {orders.length === 0 ? (
        <Empty description="Hali buyurtma yo'q" />
      ) : (
        <Table
          rowKey="_id"
          dataSource={orders}
          pagination={{ pageSize: 20 }}
          columns={[
            { title: "Sovg'a", dataIndex: 'rewardTitle' },
            { title: 'Narxi', dataIndex: 'starCost', render: (v) => `⭐ ${v}` },
            {
              title: 'Holati',
              dataIndex: 'status',
              render: (v) => (
                <Tag color={STATUS_LABELS[v]?.color}>{STATUS_LABELS[v]?.text || v}</Tag>
              ),
            },
            {
              title: 'Sana',
              dataIndex: 'created',
              render: (v) => new Date(v).toLocaleString(),
            },
          ]}
        />
      )}
    </div>
  );
}
