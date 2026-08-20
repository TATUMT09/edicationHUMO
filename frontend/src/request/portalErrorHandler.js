import { notification } from 'antd';
import codeMessage from './codeMessage';

// Mirrors errorHandler.js but scoped to the Student session: touches only
// the `portal_auth` localStorage key and redirects to /portal/logout, never
// the Admin `auth` key or /logout — the two sessions must never clobber
// each other's expiry handling.
const portalErrorHandler = (error) => {
  if (!navigator.onLine) {
    notification.config({ duration: 15, maxCount: 1 });
    notification.error({
      message: 'Internet aloqasi yoq',
      description: 'Internetga ulanishni tekshiring',
    });
    return {
      success: false,
      result: null,
      message: 'Internetga ulanishni tekshiring',
    };
  }

  const { response } = error;

  if (!response) {
    notification.config({ duration: 20, maxCount: 1 });
    return {
      success: false,
      result: null,
      message: "Serverga ulanib bo'lmadi, birozdan so'ng qayta urining",
    };
  }

  if (response?.data?.jwtExpired) {
    window.localStorage.removeItem('portal_auth');
    window.location.href = '/portal/logout';
  }

  if (response && response.status) {
    const message = response.data && response.data.message;
    const errorText = message || codeMessage[response.status];
    const { status } = response;
    notification.config({ duration: 8, maxCount: 2 });
    notification.error({
      message: `Xatolik ${status}`,
      description: errorText,
    });

    if (response?.data?.error?.name === 'JsonWebTokenError') {
      window.localStorage.removeItem('portal_auth');
      window.location.href = '/portal/logout';
    } else return response.data;
  } else {
    notification.config({ duration: 15, maxCount: 1 });
    notification.error({
      message: "Serverga ulanishda muammo",
      description: "Birozdan so'ng qayta urinib ko'ring",
    });
    return {
      success: false,
      result: null,
      message: "Serverga ulanib bo'lmadi",
    };
  }
};

export default portalErrorHandler;
