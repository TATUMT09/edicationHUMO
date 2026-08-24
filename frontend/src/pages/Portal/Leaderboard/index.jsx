import { useEffect, useState } from 'react';
import { Spin, Card, Table, Radio, Avatar, Tag } from 'antd';
import { UserOutlined, TrophyFilled, CheckCircleOutlined } from '@ant-design/icons';
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
// Top-3 names get a distinct color instead of default text — the small
// visual flourish students actually notice on a leaderboard.
const RANK_COLOR = { 1: '#d4af37', 2: '#8c8c8c', 3: '#b8712f' };
const RANK_ROW_BG = { 1: '#fffbe6', 2: '#fafafa', 3: '#fff2e8' };

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
          onRow={(r) => ({
            style: RANK_ROW_BG[r.rank] ? { background: RANK_ROW_BG[r.rank] } : undefined,
          })}
          columns={[
            {
              title: '#',
              dataIndex: 'rank',
              width: 60,
              render: (rank) => (
                <span style={{ fontWeight: rank <= 3 ? 'bold' : 'normal' }}>
                  {MEDAL[rank] || rank}
                </span>
              ),
            },
            {
              title: "O'quvchi",
              dataIndex: 'student',
              render: (s, r) => (
                <span>
                  <Avatar size="small" icon={<UserOutlined />} src={s.photo} />{' '}
                  <span
                    style={{
                      fontWeight: RANK_COLOR[r.rank] ? 'bold' : 'normal',
                      color: RANK_COLOR[r.rank],
                    }}
                  >
                    {s.name}
                  </span>{' '}
                  {s._id === student?._id && <Tag color="blue">Siz</Tag>}
                </span>
              ),
            },
            {
              title: (
                <>
                  <CheckCircleOutlined /> Yechilgan
                </>
              ),
              dataIndex: 'solvedCount',
              align: 'center',
              render: (v) => v ?? 0,
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
