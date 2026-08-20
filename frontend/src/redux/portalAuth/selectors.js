import { createSelector } from 'reselect';

export const selectPortalAuth = (state) => state.portalAuth;
export const selectCurrentStudent = createSelector([selectPortalAuth], (auth) => auth.current);
export const isPortalLoggedIn = createSelector([selectPortalAuth], (auth) => auth.isLoggedIn);
