import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Input, Result } from 'antd';
import { MailOutlined, SendOutlined } from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import portalRequest from '@/request/portalRequest';
import Loading from '@/components/Loading';
import AuthModule from '@/modules/AuthModule';

const TELEGRAM_BOT_USERNAME = 'HUMO_EDUKATION_bot';

export default function PortalForgetPasswordPage() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [telegramLinkToken, setTelegramLinkToken] = useState('');

  const onFinish = async (values) => {
    setIsLoading(true);
    const data = await portalRequest.forgetPassword({ email: values.email });
    setIsLoading(false);
    if (data.success) {
      setEmail(values.email);
      setTelegramLinkToken(data.result?.telegramLinkToken || '');
      setIsSuccess(true);
    }
  };

  const FormContainer = () => (
    <Loading isLoading={isLoading}>
      <Form layout="vertical" name="portal_forget" onFinish={onFinish}>
        <Form.Item
          name="email"
          label={translate('email')}
          rules={[{ required: true }, { type: 'email' }]}
        >
          <Input prefix={<MailOutlined />} placeholder="email@example.com" size="large" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} size="large" block>
            {translate('Request new Password')}
          </Button>
        </Form.Item>
        <div>
          {translate('Or')} <a href="/portal/login">{translate('already have account Login')}</a>
        </div>
      </Form>
    </Loading>
  );

  if (!isSuccess) {
    return <AuthModule authContent={<FormContainer />} AUTH_TITLE="Parolni unutdim" />;
  }

  return (
    <AuthModule
      authContent={
        <Result
          status="success"
          title="Kod tayyor"
          subTitle={`${email} uchun tiklash kodi tayyorlandi — Telegram orqali oling`}
          extra={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {telegramLinkToken && (
                <Button
                  size="large"
                  icon={<SendOutlined />}
                  style={{ background: '#229ED9', color: '#fff', border: 'none' }}
                  href={`https://t.me/${TELEGRAM_BOT_USERNAME}?start=${telegramLinkToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telegram orqali kodni olish
                </Button>
              )}
              <Button
                type="primary"
                onClick={() => navigate('/portal/resetpassword', { state: { email } })}
              >
                Kodni kiritish
              </Button>
            </div>
          }
        />
      }
      AUTH_TITLE="Parolni unutdim"
    />
  );
}
