import './style/app.css';

import { Suspense, lazy } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '@/redux/store';
import PageLoader from '@/components/PageLoader';

const IdurarOs = lazy(() => import('./apps/IdurarOs'));
const PortalApp = lazy(() => import('./apps/PortalApp'));

// Splits the Admin ERP tree from the public Student portal tree by URL
// prefix, before either one (and before their independent auth/session
// state) is ever considered — IdurarOs itself only knows about the Admin
// session, so this decision cannot live any lower in the tree.
function RootAppInner() {
  const location = useLocation();
  const isPortal = location.pathname.startsWith('/portal');

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
