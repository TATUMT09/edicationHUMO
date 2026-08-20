import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Input } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import useLanguage from '@/locale/useLanguage';
import { portalLogin } from '@/redux/portalAuth/actions';
import { selectPortalAuth } from '@/redux/portalAuth/selectors';
import Loading from '@/components/Loading';
import AuthModule from '@/modules/AuthModule';

export default function PortalLoginPage() {
  const translate = useLanguage();
  const { isLoading, isSuccess } = useSelector(selectPortalAuth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = (values) => {
    dispatch(portalLogin({ loginData: values }));
  };

  useEffect(() => {
    if (isSuccess) navigate('/portal');
  }, [isSuccess]);

  const FormContainer = () => (
    <Loading isLoading={isLoading}>
      <Form layout="vertical" name="portal_login" onFinish={onFinish}>
        <Form.Item
          label={translate('email')}
          name="email"
          rules={[{ required: true }, { type: 'email' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="email@example.com" size="large" />
        </Form.Item>
        <Form.Item label={translate('password')} name="password" rules={[{ required: true }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 12 }}>
          <a href="/portal/forgetpassword">{translate('Forgot password')}</a>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} size="large" block>
            {translate('Log in')}
          </Button>
        </Form.Item>
        <div>
          Hisobingiz yo'qmi? <a href="/portal/register">Ro'yxatdan o'ting</a>
        </div>
      </Form>
    </Loading>
  );

  return <AuthModule authContent={<FormContainer />} AUTH_TITLE="O'quvchi kabinetiga kirish" />;
}
