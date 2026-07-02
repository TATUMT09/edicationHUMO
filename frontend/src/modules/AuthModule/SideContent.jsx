import { Space, Layout, Divider, Typography } from 'antd';
import logo from '@/style/images/humo-logo.jpg';
import useLanguage from '@/locale/useLanguage';
import { useSelector } from 'react-redux';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function SideContent() {
  const translate = useLanguage();

  return (
    <Content
      style={{
        padding: '150px 30px 30px',
        width: '100%',
        maxWidth: '450px',
        margin: '0 auto',
      }}
      className="sideContent"
    >
      <div style={{ width: '100%' }}>
        <img
          src={logo}
          alt="HUMO Education"
          style={{ margin: '0 0 40px', display: 'block', borderRadius: '50%' }}
          height={90}
          width={90}
        />

        <Title level={1} style={{ fontSize: 28 }}>
          HUMO Education
        </Title>
        <Text>To'lovlarni va o'quvchilarni boshqarish tizimi</Text>

        <div className="space20"></div>
      </div>
    </Content>
  );
}
