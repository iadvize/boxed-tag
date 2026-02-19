import { initIAdvizeIframe } from '@iadvize-oss/boxed-tag';

window.iAdvizeInterface = window.iAdvizeInterface || [];
window.iAdvizeInterface.config = {
  sid: 1,
};

const iAdvizePlatform = 'iAdvizePlatform';
initIAdvizeIframe(iAdvizePlatform);
