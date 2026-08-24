import { Routes, Route, Navigate } from 'react-router-dom';

import PortalLogin from '@/pages/Portal/Login';
import PortalRegister from '@/pages/Portal/Register';
import PortalVerifyCode from '@/pages/Portal/VerifyCode';
import PortalForgetPassword from '@/pages/Portal/ForgetPassword';
import PortalResetPassword from '@/pages/Portal/ResetPassword';
import NotFound from '@/pages/NotFound';

export default function PortalAuthRouter() {
  return (
    <Routes>
      <Route element={<PortalLogin />} path="/" />
      <Route element={<PortalLogin />} path="/portal" />
      <Route element={<PortalLogin />} path="/portal/login" />
      <Route element={<Navigate to="/portal/login" replace />} path="/portal/logout" />
      <Route element={<PortalRegister />} path="/portal/register" />
      <Route element={<PortalVerifyCode />} path="/portal/verify" />
      <Route element={<PortalForgetPassword />} path="/portal/forgetpassword" />
      <Route element={<PortalResetPassword />} path="/portal/resetpassword" />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
