import './style/app.css';

import { Suspense, lazy } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import store from '@/redux/store';
import PageLoader from '@/components/PageLoader';
import { isLoggedIn as isAdminLoggedIn } from '@/redux/auth/selectors';

const IdurarOs = lazy(() => import('./apps/IdurarOs'));
const PortalApp = lazy(() => import('./apps/PortalApp'));

// Splits the Admin ERP tree from the public Student portal tree by URL
// prefix, before either one (and before their independent auth/session
// state) is ever considered — IdurarOs itself only knows about the Admin
// session, so this decision cannot live any lower in the tree.
//
// The bare domain ("/") is the one path both trees could claim. It's given
// to the public portal — that's the door a stranger walks through — unless
// an admin is already signed in, so a bookmarked "/" still opens their
// dashboard instead of bouncing them to the student login.
function RootAppInner() {
  const location = useLocation();
  const adminLoggedIn = useSelector(isAdminLoggedIn);
  const isPortal =
    location.pathname.startsWith('/portal') || (location.pathname === '/' && !adminLoggedIn);

  return <Suspense fallback={<PageLoader />}>{isPortal ? <PortalApp /> : <IdurarOs />}</Suspense>;
}

export default function RoutApp() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <RootAppInner />
      </Provider>
    </BrowserRouter>
  );
}
