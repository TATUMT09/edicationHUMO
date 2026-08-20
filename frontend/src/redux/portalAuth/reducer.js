import * as actionTypes from './types';

const INITIAL_STATE = {
  current: {},
  isLoggedIn: false,
  isLoading: false,
  isSuccess: false,
  pendingVerificationEmail: null,
};

const portalAuthReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case actionTypes.REQUEST_LOADING:
      return {
        ...state,
        isLoggedIn: false,
        isLoading: true,
      };
    case actionTypes.REQUEST_FAILED:
      return {
        ...INITIAL_STATE,
        pendingVerificationEmail: state.pendingVerificationEmail,
      };
    case actionTypes.REQUEST_SUCCESS:
      return {
        current: action.payload,
        isLoggedIn: true,
        isLoading: false,
        isSuccess: true,
        pendingVerificationEmail: null,
      };
    case actionTypes.VERIFICATION_PENDING:
      return {
        ...INITIAL_STATE,
        isLoading: false,
        pendingVerificationEmail: action.payload,
      };
    case actionTypes.LOGOUT_SUCCESS:
      return INITIAL_STATE;
    case actionTypes.LOGOUT_FAILED:
      return {
        ...state,
        current: action.payload,
        isLoggedIn: true,
        isLoading: false,
        isSuccess: true,
      };
    default:
      return state;
  }
};

export default portalAuthReducer;
