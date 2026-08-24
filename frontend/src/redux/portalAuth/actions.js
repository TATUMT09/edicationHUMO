import * as actionTypes from './types';
import portalRequest from '@/request/portalRequest';
import storePersist from '@/redux/storePersist';

const persistAndDispatch = (dispatch, result) => {
  const state = {
    current: result,
    isLoggedIn: true,
    isLoading: false,
    isSuccess: true,
  };
  storePersist.set('portal_auth', state);
  dispatch({ type: actionTypes.REQUEST_SUCCESS, payload: result });
};

export const portalRegister =
  ({ registerData }) =>
  async (dispatch) => {
    dispatch({ type: actionTypes.REQUEST_LOADING });
    const data = await portalRequest.register(registerData);

    if (data.success === true) {
      dispatch({
        type: actionTypes.VERIFICATION_PENDING,
        payload: { email: registerData.email, telegramLinkToken: data.result?.telegramLinkToken },
      });
    } else {
      dispatch({ type: actionTypes.REQUEST_FAILED });
    }
  };

export const portalVerifyCode =
  ({ email, code }) =>
  async (dispatch) => {
    dispatch({ type: actionTypes.REQUEST_LOADING });
    const data = await portalRequest.verifyCode({ email, code });

    if (data.success === true) {
      persistAndDispatch(dispatch, data.result);
    } else {
      dispatch({ type: actionTypes.REQUEST_FAILED });
    }
  };

export const portalResendCode =
  ({ email }) =>
  async (dispatch) => {
    const data = await portalRequest.resendCode({ email });
    if (data.success === true && data.result?.telegramLinkToken) {
      dispatch({
        type: actionTypes.TELEGRAM_LINK_TOKEN_UPDATED,
        payload: data.result.telegramLinkToken,
      });
    }
    return data;
  };

export const portalLogin =
  ({ loginData }) =>
  async (dispatch) => {
    dispatch({ type: actionTypes.REQUEST_LOADING });
    const data = await portalRequest.login(loginData);

    if (data.success === true) {
      persistAndDispatch(dispatch, data.result);
    } else {
      dispatch({ type: actionTypes.REQUEST_FAILED });
    }
  };

export const portalResetPassword =
  ({ resetPasswordData }) =>
  async (dispatch) => {
    dispatch({ type: actionTypes.REQUEST_LOADING });
    const data = await portalRequest.resetPassword(resetPasswordData);

    if (data.success === true) {
      persistAndDispatch(dispatch, data.result);
    } else {
      dispatch({ type: actionTypes.REQUEST_FAILED });
    }
  };

export const portalLogout = () => async (dispatch) => {
  dispatch({ type: actionTypes.LOGOUT_SUCCESS });
  storePersist.remove('portal_auth');
  const data = await portalRequest.logout();
  if (data?.success === false) {
    dispatch({ type: actionTypes.LOGOUT_FAILED, payload: data.result });
  }
};
