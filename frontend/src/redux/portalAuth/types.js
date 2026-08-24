export const REQUEST_LOADING = 'PORTAL_AUTH_REQUEST_LOADING';
export const REQUEST_SUCCESS = 'PORTAL_AUTH_REQUEST_SUCCESS';
export const REQUEST_FAILED = 'PORTAL_AUTH_REQUEST_FAILED';

// Set after a successful /register call, before the email is verified —
// lets the Register/VerifyCode pages survive a refresh without losing
// which email is mid-verification.
export const VERIFICATION_PENDING = 'PORTAL_AUTH_VERIFICATION_PENDING';

// Refreshed whenever the code is resent — the Telegram deep-link token
// changes with every new code, independent of the loading/success cycle.
export const TELEGRAM_LINK_TOKEN_UPDATED = 'PORTAL_AUTH_TELEGRAM_LINK_TOKEN_UPDATED';

export const LOGOUT_SUCCESS = 'PORTAL_AUTH_LOGOUT_SUCCESS';
export const LOGOUT_FAILED = 'PORTAL_AUTH_LOGOUT_FAILED';
