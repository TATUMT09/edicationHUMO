import { Suspense, useEffect, useState } from 'react';
import { Layout, Menu, Button, Avatar, message } from 'antd';
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
  GiftOutlined,
  ReadOutlined,
  CloseCircleOutlined,
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

  const blockCopy = (e) => {
    e.preventDefault();
    message.warning("Nusxa olish taqiqlangan");
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
      key: 'rewards',
      icon: <GiftOutlined />,
      label: <Link to="/portal/rewards">Sovg'alar</Link>,
    },
    {
      key: 'library',
      icon: <ReadOutlined />,
      label: <Link to="/portal/library">Kutubxona</Link>,
    },
    {
      key: 'mistakes',
      icon: <CloseCircleOutlined />,
      label: <Link to="/portal/mistakes">Xatolarim</Link>,
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
        className="portal-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Link to="/portal" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <img src={logo} alt="HUMO Education" style={{ height: 36, borderRadius: '50%' }} />
          <span className="portal-hide-mobile" style={{ fontSize: 18, fontWeight: 'bold', color: '#1640D6' }}>
            HUMO Education
          </span>
        </Link>
        <Menu
          className="portal-header-menu"
          mode="horizontal"
          selectable={false}
          items={menuItems}
          style={{ flex: 1, borderBottom: 'none', minWidth: 0 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {totalStars != null && (
            <span style={{ fontWeight: 'bold', color: '#d48806', whiteSpace: 'nowrap' }}>
              ⭐ {totalStars}
            </span>
          )}
          <Avatar icon={<UserOutlined />} src={student?.photo} />
          <span className="portal-user-name">{student?.name}</span>
          <Button icon={<LogoutOutlined />} onClick={onLogout}>
            <span className="portal-hide-mobile">{translate('Logout')}</span>
          </Button>
        </div>
      </Header>
      <Content className="portal-content">
        <div
          className="portal-no-copy"
          style={{ maxWidth: 1100, margin: '0 auto' }}
          onCopy={blockCopy}
          onCut={blockCopy}
        >
          <Suspense fallback={<PageLoader />}>
            <PortalRouter />
          </Suspense>
        </div>
      </Content>
    </Layout>
  );
}
