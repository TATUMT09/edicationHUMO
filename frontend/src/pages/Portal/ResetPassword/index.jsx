import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Input } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import { portalResetPassword } from '@/redux/portalAuth/actions';
import { selectPortalAuth } from '@/redux/portalAuth/selectors';
import portalRequest from '@/request/portalRequest';
import Loading from '@/components/Loading';
import AuthModule from '@/modules/AuthModule';

export default function PortalResetPasswordPage() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading: isSubmitting, isSuccess } = useSelector(selectPortalAuth);
  const prefilledEmail = location.state?.email || '';

  const [step, setStep] = useState('code');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(prefilledEmail);
  const [resetToken, setResetToken] = useState('');

  const onFinishCode = async (values) => {
    setIsLoading(true);
    const data = await portalRequest.verifyResetCode({ email: values.email, code: values.code });
    setIsLoading(false);
    if (data.success) {
      setEmail(values.email);
      setResetToken(data.result.resetToken);
      setStep('password');
    }
  };

  const onFinishPassword = (values) => {
    dispatch(
      portalResetPassword({
        resetPasswordData: {
          email,
          resetToken,
          password: values.password,
        },
      })
    );
  };

  useEffect(() => {
    if (isSuccess) navigate('/portal');
  }, [isSuccess]);

  const CodeStep = () => (
    <Loading isLoading={isLoading}>
      <Form
        layout="vertical"
        name="portal_reset_code"
        onFinish={onFinishCode}
        initialValues={{ email: prefilledEmail }}
      >
        <Form.Item
          name="email"
          label={translate('email')}
          rules={[{ required: true }, { type: 'email' }]}
        >
          <Input prefix={<MailOutlined />} placeholder="email@example.com" size="large" />
        </Form.Item>
        <Form.Item name="code" label="Tasdiqlash kodi" rules={[{ required: true, len: 6 }]}>
          <Input
            maxLength={6}
            inputMode="numeric"
            size="large"
            style={{ letterSpacing: 8, fontSize: 22, textAlign: 'center' }}
            placeholder="000000"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} size="large" block>
            Davom etish
          </Button>
        </Form.Item>
      </Form>
    </Loading>
  );

  const PasswordStep = () => (
    <Loading isLoading={isSubmitting}>
      <Form layout="vertical" name="portal_reset_password" onFinish={onFinishPassword}>
        <Form.Item
          name="password"
          label="Yangi parol"
          rules={[{ required: true }, { min: 6, message: 'Kamida 6 belgi' }]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Yangi parolni tasdiqlang"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Parolni qayta kiriting' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve();
                return Promise.reject(new Error('Parollar mos kelmadi'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isSubmitting} size="large" block>
            {translate('update password')}
          </Button>
        </Form.Item>
      </Form>
    </Loading>
  );

  return (
    <AuthModule
      authContent={step === 'code' ? <CodeStep /> : <PasswordStep />}
      AUTH_TITLE="Parolni tiklash"
    />
  );
}
