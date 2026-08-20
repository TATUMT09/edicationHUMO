import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';

import { isPortalLoggedIn } from '@/redux/portalAuth/selectors';
import Localization from '@/locale/Localization';
import PageLoader from '@/components/PageLoader';
import PortalAuthRouter from '@/router/PortalAuthRouter';

const PortalMain = lazy(() => import('./PortalMain'));

export default function PortalApp() {
  const loggedIn = useSelector(isPortalLoggedIn);

  if (!loggedIn)
    return (
      <Localization>
        <PortalAuthRouter />
      </Localization>
    );

  return (
    <Localization>
      <Suspense fallback={<PageLoader />}>
        <PortalMain />
      </Suspense>
    </Localization>
  );
}
