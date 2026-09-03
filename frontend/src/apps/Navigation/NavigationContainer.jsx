import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Drawer, Layout, Menu } from 'antd';

import { useAppContext } from '@/context/appContext';
import { selectCurrentAdmin } from '@/redux/auth/selectors';

import useLanguage from '@/locale/useLanguage';
import logoIcon from '@/style/images/humo-logo.jpg';

import useResponsive from '@/hooks/useResponsive';

import {
  CustomerServiceOutlined,
  DashboardOutlined,
  UserOutlined,
  MenuOutlined,
  FileOutlined,
  WalletOutlined,
  ScheduleOutlined,
  TeamOutlined,
  TableOutlined,
  BarChartOutlined,
  RobotOutlined,
  BookOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  PlayCircleOutlined,
  ReadOutlined,
  GiftOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

export default function Navigation() {
  const { isMobile } = useResponsive();

  return isMobile ? <MobileSidebar /> : <Sidebar collapsible={false} />;
}

function Sidebar({ collapsible, isMobile = false }) {
  let location = useLocation();

  const { state: stateApp, appContextAction } = useAppContext();
  const { isNavMenuClose } = stateApp;
  const { navMenu } = appContextAction;
  const [showLogoApp, setLogoApp] = useState(isNavMenuClose);
  const [currentPath, setCurrentPath] = useState(location.pathname.slice(1));

  const translate = useLanguage();
  const navigate = useNavigate();
  const currentAdmin = useSelector(selectCurrentAdmin);
  const isTeacher = currentAdmin?.role === 'teacher';

  const items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to={'/'}>{translate('dashboard')}</Link>,
    },
    {
      key: 'assistant',
      icon: <RobotOutlined />,
      label: <Link to={'/assistant'}>{translate('assistant')}</Link>,
    },
    {
      key: 'attendance',
      icon: <ScheduleOutlined />,
      label: <Link to={'/attendance'}>{translate('attendance')}</Link>,
    },
    {
      key: 'attendance-report',
      icon: <TableOutlined />,
      label: <Link to={'/attendance-report'}>{translate('attendance_report')}</Link>,
    },
    {
      key: 'monthly-payments',
      icon: <WalletOutlined />,
      label: <Link to={'/monthly-payments'}>{translate('monthly_payments')}</Link>,
    },
    {
      key: 'payment-history',
      icon: <FileOutlined />,
      label: <Link to={'/payment-history'}>{translate('payment_history')}</Link>,
    },
    {
      key: 'payment-report',
      icon: <BarChartOutlined />,
      label: <Link to={'/payment-report'}>{translate('payment_report')}</Link>,
    },
    {
      key: 'customer',
      icon: <CustomerServiceOutlined />,
      label: <Link to={'/customer'}>{translate('customers')}</Link>,
    },
    !isTeacher && {
      key: 'parent',
      icon: <UserOutlined />,
      label: <Link to={'/parent'}>{translate('parents')}</Link>,
    },
    !isTeacher && {
      key: 'group',
      icon: <TeamOutlined />,
      label: <Link to={'/group'}>{translate('groups')}</Link>,
    },
    !isTeacher && {
      key: 'staff',
      icon: <TeamOutlined />,
      label: <Link to={'/staff'}>{translate('staff')}</Link>,
    },
    {
      key: 'subject',
      icon: <BookOutlined />,
      label: <Link to={'/subject'}>{translate('subjects')}</Link>,
    },
    {
      key: 'test',
      icon: <FileTextOutlined />,
      label: <Link to={'/test'}>{translate('tests')}</Link>,
    },
    {
      key: 'question',
      icon: <QuestionCircleOutlined />,
      label: <Link to={'/question'}>{translate('questions')}</Link>,
    },
    {
      key: 'test-stats',
      icon: <BarChartOutlined />,
      label: <Link to={'/test/stats'}>Savollar statistikasi</Link>,
    },
    {
      key: 'video-lesson',
      icon: <PlayCircleOutlined />,
      label: <Link to={'/video-lesson'}>{translate('video_lessons')}</Link>,
    },
    {
      key: 'book',
      icon: <ReadOutlined />,
      label: <Link to={'/book'}>{translate('books')}</Link>,
    },
    {
      key: 'reward',
      icon: <GiftOutlined />,
      label: <Link to={'/reward'}>{translate('rewards')}</Link>,
    },
    {
      key: 'rewardorder',
      icon: <ShoppingCartOutlined />,
      label: <Link to={'/rewardorder'}>{translate('reward_orders')}</Link>,
    },
  ].filter(Boolean);

  useEffect(() => {
    if (location)
      if (currentPath !== location.pathname) {
        if (location.pathname === '/') {
          setCurrentPath('dashboard');
        } else setCurrentPath(location.pathname.slice(1));
      }
  }, [location, currentPath]);

  useEffect(() => {
    if (isNavMenuClose) {
      setLogoApp(isNavMenuClose);
    }
    const timer = setTimeout(() => {
      if (!isNavMenuClose) {
        setLogoApp(isNavMenuClose);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isNavMenuClose]);
  const onCollapse = () => {
    navMenu.collapse();
  };

  return (
    <Sider
      collapsible={collapsible}
      collapsed={collapsible ? isNavMenuClose : collapsible}
      onCollapse={onCollapse}
      className="navigation"
      width={256}
      style={{
        overflow: 'auto',
        height: '100vh',

        position: isMobile ? 'absolute' : 'relative',
        bottom: '20px',
        ...(!isMobile && {
          // border: 'none',
          ['left']: '20px',
          top: '20px',
          // borderRadius: '8px',
        }),
      }}
      theme={'light'}
    >
      <div
        className="logo"
        onClick={() => navigate('/')}
        style={{
          cursor: 'pointer',
        }}
      >
        <img
          src={logoIcon}
          alt="HUMO Education"
          style={{ marginLeft: '-5px', height: '40px', borderRadius: '50%' }}
        />

        {!showLogoApp && (
          <span
            style={{
              marginLeft: '10px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1640D6',
            }}
          >
            HUMO Education
          </span>
        )}
      </div>
      <Menu
        items={items}
        mode="inline"
        theme={'light'}
        selectedKeys={[currentPath]}
        style={{
          width: 256,
        }}
      />
    </Sider>
  );
}

function MobileSidebar() {
  const [visible, setVisible] = useState(false);
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Button
        type="text"
        size="large"
        onClick={showDrawer}
        className="mobile-sidebar-btn"
        style={{ ['marginLeft']: 25 }}
      >
        <MenuOutlined style={{ fontSize: 18 }} />
      </Button>
      <Drawer
        width={250}
        // style={{ backgroundColor: 'rgba(255, 255, 255, 1)' }}
        placement={'left'}
        closable={false}
        onClose={onClose}
        open={visible}
      >
        <Sidebar collapsible={false} isMobile={true} />
      </Drawer>
    </>
  );
}
