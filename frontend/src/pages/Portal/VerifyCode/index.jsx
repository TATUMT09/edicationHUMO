import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Input } from 'antd';

import useLanguage from '@/locale/useLanguage';
import { portalVerifyCode, portalResendCode } from '@/redux/portalAuth/actions';
import { selectPortalAuth } from '@/redux/portalAuth/selectors';
import Loading from '@/components/Loading';
import AuthModule from '@/modules/AuthModule';

const RESEND_COOLDOWN_SECONDS = 60;

export default function PortalVerifyCodePage() {
  const translate = useLanguage();
  const { isLoading, isSuccess, pendingVerificationEmail } = useSelector(selectPortalAuth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!pendingVerificationEmail) navigate('/portal/register');
  }, [pendingVerificationEmail]);

  useEffect(() => {
    if (isSuccess) navigate('/portal');
  }, [isSuccess]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const onFinish = (values) => {
    dispatch(portalVerifyCode({ email: pendingVerificationEmail, code: values.code }));
  };

  const onResend = async () => {
    setResending(true);
    await dispatch(portalResendCode({ email: pendingVerificationEmail }));
    setResending(false);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const FormContainer = () => (
    <Loading isLoading={isLoading}>
      <p>
        <b>{pendingVerificationEmail}</b> manziliga 6 xonali tasdiqlash kodi yuborildi. Kodni pastga
        kiriting.
      </p>
      <Form layout="vertical" name="portal_verify" onFinish={onFinish}>
        <Form.Item
          label="Tasdiqlash kodi"
          name="code"
          rules={[{ required: true, len: 6, message: '6 xonali kod' }]}
        >
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
            Tasdiqlash
          </Button>
        </Form.Item>
        <Button type="link" onClick={onResend} disabled={cooldown > 0} loading={resending}>
          {cooldown > 0 ? `Qayta yuborish (${cooldown}s)` : 'Kodni qayta yuborish'}
        </Button>
      </Form>
    </Loading>
  );

  return <AuthModule authContent={<FormContainer />} AUTH_TITLE="Emailni tasdiqlash" />;
}
