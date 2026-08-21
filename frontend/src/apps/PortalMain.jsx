import { Suspense, useEffect, useState } from 'react';
import { Layout, Menu, Button, Avatar } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  HistoryOutlined,
  BarChartOutlined,
  TrophyOutlined,
  StarOutlined,
} from '@ant-design/icons';

import { selectCurrentStudent } from '@/redux/portalAuth/selectors';
import { portalLogout } from '@/redux/portalAuth/actions';
import useLanguage from '@/locale/useLanguage';
import PageLoader from '@/components/PageLoader';
import PortalRouter from '@/router/PortalRouter';
import portalRequest from '@/request/portalRequest';
import logo from '@/style/images/humo-logo.jpg';

const { Header, Content } = Layout;

export default function PortalMain() {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const student = useSelector(selectCurrentStudent);
  const [totalStars, setTotalStars] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await portalRequest.getStatsSummary();
      if (data.success) setTotalStars(data.result.totalStars);
    })();
  }, []);

  const onLogout = () => {
    dispatch(portalLogout());
    navigate('/portal/login');
  };

  const menuItems = [
    {
      key: 'subjects',
      icon: <HomeOutlined />,
      label: <Link to="/portal">{translate('subjects')}</Link>,
    },
    {
      key: 'leaderboard',
      icon: <TrophyOutlined />,
      label: <Link to="/portal/leaderboard">Reyting</Link>,
    },
    {
      key: 'stars',
      icon: <StarOutlined />,
      label: <Link to="/portal/stars">Yulduzlar</Link>,
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: <Link to="/portal/history">{translate('history')}</Link>,
    },
    {
      key: 'stats',
      icon: <BarChartOutlined />,
      label: <Link to="/portal/stats">{translate('statistics')}</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          paddingInline: 20,
        }}
      >
        <Link to="/portal" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logo} alt="HUMO Education" style={{ height: 36, borderRadius: '50%' }} />
          <span style={{ fontSize: 18, fontWeight: 'bold', color: '#1640D6' }}>HUMO Education</span>
        </Link>
        <Menu
          mode="horizontal"
          selectable={false}
          items={menuItems}
          style={{ flex: 1, marginLeft: 40, borderBottom: 'none', minWidth: 0 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {totalStars != null && (
            <span style={{ fontWeight: 'bold', color: '#d48806' }}>⭐ {totalStars}</span>
          )}
          <Avatar icon={<UserOutlined />} src={student?.photo} />
          <span>{student?.name}</span>
          <Button icon={<LogoutOutlined />} onClick={onLogout}>
            {translate('Logout')}
          </Button>
        </div>
      </Header>
      <Content style={{ padding: 24 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Suspense fallback={<PageLoader />}>
            <PortalRouter />
          </Suspense>
        </div>
      </Content>
    </Layout>
  );
}
