import { useState, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import { resetPassword } from '@/redux/auth/actions';
import { verifyResetCode } from '@/auth';
import { selectAuth } from '@/redux/auth/selectors';

import { Form, Button, Input } from 'antd';
import { MailOutlined } from '@ant-design/icons';

import ResetPasswordForm from '@/forms/ResetPasswordForm';

import useLanguage from '@/locale/useLanguage';

import Loading from '@/components/Loading';
import AuthModule from '@/modules/AuthModule';

const ResetPassword = () => {
  const translate = useLanguage();
  const { isLoading: isSubmitting, isSuccess } = useSelector(selectAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledEmail = location.state?.email || '';

  const dispatch = useDispatch();

  const [step, setStep] = useState('code');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(prefilledEmail);
  const [resetToken, setResetToken] = useState('');

  const onFinishCode = async (values) => {
    setIsLoading(true);
    const data = await verifyResetCode({ email: values.email, code: values.code });
    setIsLoading(false);
    if (data.success) {
      setEmail(values.email);
      setResetToken(data.result.resetToken);
      setStep('password');
    }
  };

  const onFinishPassword = (values) => {
    dispatch(
      resetPassword({
        resetPasswordData: {
          email,
          resetToken,
          password: values.password,
        },
      })
    );
  };

  useEffect(() => {
    if (isSuccess) navigate('/');
  }, [isSuccess]);

  const CodeStep = () => (
    <Loading isLoading={isLoading}>
      <Form
        name="reset_code"
        className="login-form"
        onFinish={onFinishCode}
        initialValues={{ email: prefilledEmail }}
      >
        <Form.Item name="email" rules={[{ required: true }, { type: 'email' }]}>
          <Input
            prefix={<MailOutlined className="site-form-item-icon" />}
            type="email"
            placeholder={translate('email')}
            size="large"
          />
        </Form.Item>
        <Form.Item name="code" rules={[{ required: true, len: 6, message: '6 xonali kod' }]}>
          <Input
            maxLength={6}
            inputMode="numeric"
            size="large"
            style={{ letterSpacing: 8, fontSize: 22, textAlign: 'center' }}
            placeholder="000000"
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="login-form-button"
            size="large"
          >
            Davom etish
          </Button>
        </Form.Item>
      </Form>
    </Loading>
  );

  const PasswordStep = () => (
    <Loading isLoading={isSubmitting}>
      <Form name="reset_password" className="login-form" onFinish={onFinishPassword}>
        <ResetPasswordForm />
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            className="login-form-button"
            size="large"
          >
            {translate('update password')}
          </Button>
        </Form.Item>
      </Form>
    </Loading>
  );

  return (
    <AuthModule
      authContent={step === 'code' ? <CodeStep /> : <PasswordStep />}
      AUTH_TITLE="Reset Password"
    />
  );
};

export default ResetPassword;
