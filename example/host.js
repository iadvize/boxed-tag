import { initIAdvizeHost } from '@iadvize-oss/boxed-tag';

// In production, this should be the specific origin of your iframe (e.g. https://chat.brand.com)
// For this local example, we use the current origin.
const targetOrigin = window.location.origin;

initIAdvizeHost('myIframeId', targetOrigin);
