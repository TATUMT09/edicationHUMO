import { useEffect, useState } from 'react';
import { Spin, Card, Table, Radio, Avatar, Tag } from 'antd';
import { UserOutlined, TrophyFilled } from '@ant-design/icons';
import { useSelector } from 'react-redux';

import portalRequest from '@/request/portalRequest';
import { selectCurrentStudent } from '@/redux/portalAuth/selectors';

const PERIOD_OPTIONS = [
  { label: 'Umumiy', value: 'overall' },
  { label: 'Kunlik', value: 'daily' },
  { label: 'Haftalik', value: 'weekly' },
  { label: 'Oylik', value: 'monthly' },
];

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function PortalLeaderboardPage() {
  const student = useSelector(selectCurrentStudent);
  const [period, setPeriod] = useState('overall');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const res = await portalRequest.getLeaderboard(period);
      if (res.success) setData(res.result);
      setLoading(false);
    })();
  }, [period]);

  return (
    <div>
      <h2>🏆 Reyting</h2>
      <Radio.Group
        options={PERIOD_OPTIONS}
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        optionType="button"
        buttonStyle="solid"
        style={{ marginBottom: 16 }}
      />

      {data && (
        <Card style={{ marginBottom: 16, background: '#f0f5ff' }}>
          <b>
            <TrophyFilled style={{ color: '#faad14', marginRight: 6 }} />
            Sizning o'rningiz: #{data.myRank}
          </b>{' '}
          — ⭐ {data.myStars}
        </Card>
      )}

      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />
      ) : (
        <Table
          rowKey={(r) => r.student._id}
          dataSource={data?.entries || []}
          pagination={false}
          rowClassName={(r) => (r.student._id === student?._id ? 'portal-leaderboard-me' : '')}
          columns={[
            {
              title: '#',
              dataIndex: 'rank',
              width: 60,
              render: (rank) => MEDAL[rank] || rank,
            },
            {
              title: "O'quvchi",
              dataIndex: 'student',
              render: (s) => (
                <span>
                  <Avatar size="small" icon={<UserOutlined />} src={s.photo} /> {s.name}{' '}
                  {s._id === student?._id && <Tag color="blue">Siz</Tag>}
                </span>
              ),
            },
            {
              title: 'Stars',
              dataIndex: 'stars',
              align: 'right',
              render: (v) => <b>⭐ {v}</b>,
            },
          ]}
        />
      )}
    </div>
  );
}
