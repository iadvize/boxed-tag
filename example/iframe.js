import { initIAdvizeIframe } from '@iadvize-oss/boxed-tag';

const sid = 1;

window.iAdvizeInterface = window.iAdvizeInterface || [];
window.iAdvizeInterface.config = {
  sid: sid,
};

const iAdvizePlatform = 'ha';

// In production, this should be the specific origin of your host page (e.g. https://www.brand.com)
// For this local example, we use the current origin.
const targetOrigin = window.location.origin;

initIAdvizeIframe(sid, iAdvizePlatform, window, targetOrigin);
