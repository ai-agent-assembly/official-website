import {publicPageUrl} from './publicPage';

interface Location {
  pathname: string;
  search: string;
  hash: string;
}
export function onRouteDidUpdate({
  location,
  previousLocation,
}: {
  location: Location;
  previousLocation: Location | null;
}): void {
  if (previousLocation && location.pathname === previousLocation.pathname)
    return;
  setTimeout(() => {
    const gtag = (window as unknown as {gtag?: (...args: unknown[]) => void})
      .gtag;
    if (typeof gtag !== 'function') return;
    const page_location = publicPageUrl();
    const params = {
      page_location,
      page_path: new URL(page_location).pathname,
      page_referrer: '',
    };
    gtag('set', params);
    gtag('event', 'page_view', params);
  });
}
