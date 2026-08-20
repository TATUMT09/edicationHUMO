import { configureStore } from '@reduxjs/toolkit';

import rootReducer from './rootReducer';
import storePersist from './storePersist';

// localStorageHealthCheck();

const AUTH_INITIAL_STATE = {
  current: {},
  isLoggedIn: false,
  isLoading: false,
  isSuccess: false,
};

const PORTAL_AUTH_INITIAL_STATE = {
  current: {},
  isLoggedIn: false,
  isLoading: false,
  isSuccess: false,
  pendingVerificationEmail: null,
};

const auth_state = storePersist.get('auth') ? storePersist.get('auth') : AUTH_INITIAL_STATE;
const portalAuth_state = storePersist.get('portal_auth')
  ? storePersist.get('portal_auth')
  : PORTAL_AUTH_INITIAL_STATE;

const initialState = { auth: auth_state, portalAuth: portalAuth_state };

const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
  devTools: import.meta.env.PROD === false, // Enable Redux DevTools in development mode
});

export default store;
