import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Input, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import { portalRegister } from '@/redux/portalAuth/actions';
import { selectPortalAuth } from '@/redux/portalAuth/selectors';
import Loading from '@/components/Loading';
import AuthModule from '@/modules/AuthModule';

export default function PortalRegisterPage() {
  const translate = useLanguage();
  const { isLoading, pendingVerificationEmail } = useSelector(selectPortalAuth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = (values) => {
    dispatch(
      portalRegister({
        registerData: {
          ...values,
          dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        },
      })
    );
  };

  useEffect(() => {
    if (pendingVerificationEmail) navigate('/portal/verify');
  }, [pendingVerificationEmail]);

  const FormContainer = () => (
    <Loading isLoading={isLoading}>
      <Form layout="vertical" name="portal_register" onFinish={onFinish}>
        <Form.Item label="Ism" name="firstName" rules={[{ required: true }]}>
          <Input prefix={<UserOutlined />} size="large" />
        </Form.Item>
        <Form.Item label="Familiya" name="lastName" rules={[{ required: true }]}>
          <Input prefix={<UserOutlined />} size="large" />
        </Form.Item>
        <Form.Item
          label="Tug'ilgan sana"
          name="dateOfBirth"
          rules={[{ required: true, message: "Tug'ilgan sanani kiriting" }]}
        >
          <DatePicker
            size="large"
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />
        </Form.Item>
        <Form.Item
          label={translate('email')}
          name="email"
          rules={[{ required: true }, { type: 'email' }]}
        >
          <Input prefix={<MailOutlined />} placeholder="email@example.com" size="large" />
        </Form.Item>
        <Form.Item
          label={translate('password')}
          name="password"
          rules={[{ required: true }, { min: 6, message: 'Kamida 6 belgi' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} size="large" block>
            Ro'yxatdan o'tish
          </Button>
        </Form.Item>
        <div>
          Hisobingiz bormi? <a href="/portal/login">Kiring</a>
        </div>
      </Form>
    </Loading>
  );

  return <AuthModule authContent={<FormContainer />} AUTH_TITLE="Ro'yxatdan o'tish" isForRegistre />;
}
