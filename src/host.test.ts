import { initIAdvizeHost, resizeIFrame } from './host';
import { initIAdvizeIframe } from './iframe';

describe('host', () => {
  afterEach(() => document.querySelector('iframe')?.remove());
  it('should call web SDK methods', (done) => {
    const navigateMock = jest.fn();
    const getMock = jest.fn();
    const setMock = jest.fn();
    const onMock = jest.fn();
    const offMock = jest.fn();
    const iframe = document.createElement('iframe');

    // Init iframe
    iframe.setAttribute('id', 'myIframeId');
    iframe.addEventListener('load', () => {
      // @ts-expect-error : window
      initIAdvizeIframe(1, 'lc', iframe.contentWindow);

      setTimeout(() => {
        iframe?.contentWindow?.iAdvizeInterface.forEach((fn) => {
          fn({
            on: onMock,
            off: offMock,
            get: getMock,
            set: setMock,
            navigate: navigateMock,
            activate: (callback: Function) => callback(),
          });
        });
      }, 200);
    });
    document.body.appendChild(iframe);

    // Init host
    initIAdvizeHost('myIframeId');

    // Web SDK on
    window.iAdvizeBoxedInterface.push({
      method: 'on',
      args: ['visitor:cookiesConsentChange'],
    });

    // Web SDK off
    window.iAdvizeBoxedInterface.push({
      method: 'off',
      args: ['visitor:cookiesConsentChange'],
    });

    // Web SDK get
    window.iAdvizeBoxedInterface.push({
      method: 'get',
      args: ['visitor:cookiesConsent'],
    });

    // Web SDK set
    window.iAdvizeBoxedInterface.push({
      method: 'set',
      args: ['visitor:cookiesConsent', true],
    });

    // Web SDK activate
    window.iAdvizeBoxedInterface.push({
      method: 'activate',
      args: {
        authenticationOption: {
          type: 'SECURED_AUTHENTICATION',
        },
      },
    });

    // Listen to cookiesConsent get
    window.addEventListener(
      'message',
      ({ data: { method, args, activation } }) => {
        if (method === 'on') {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(onMock).toHaveBeenCalledWith('visitor:cookiesConsentChange');
        }
        if (method === 'off') {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(offMock).toHaveBeenCalledWith('visitor:cookiesConsentChange');
        }
        if (method === 'navigate') {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(navigateMock).toHaveBeenCalledWith(window.location.href);
        }
        if (args?.includes('visitor:cookiesConsent') && method === 'get') {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(getMock).toHaveBeenCalledWith('visitor:cookiesConsent');
        }
        if (args?.includes('visitor:cookiesConsent') && method === 'set') {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(setMock).toHaveBeenCalledWith('visitor:cookiesConsent', true);
        }
        if (method === 'get-activate-auth-token') {
          window.iAdvizeBoxedInterface.push({
            method: 'set-activate-auth-token',
            args: `myToken`,
          });
        }
        if (method === 'activate') {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(activation).toEqual({
            authenticationOption: {
              token: 'myToken',
              type: 'SECURED_AUTHENTICATION',
            },
          });
          done();
        }
      },
    );
  });
  it('should resize iframe on window resize', (done) => {
    const iframe = document.createElement('iframe');

    // Init iframe
    iframe.setAttribute('id', 'myIframeId');
    iframe.addEventListener('load', () => {
      // @ts-expect-error : window
      initIAdvizeIframe(1, 'lc', iframe.contentWindow);
    });
    document.body.appendChild(iframe);

    // Init host
    initIAdvizeHost('myIframeId');

    window.innerWidth = 400;
    window.innerHeight = 600;
    window.dispatchEvent(new CustomEvent('resize'));

    setTimeout(() => {
      expect(iframe.contentWindow?.host?.height).toEqual(600);
      expect(iframe.contentWindow?.host?.width).toEqual(400);
      done();
    }, 1000);
  });
  it('should resize iframe on chatbox resize', () => {
    const iframe = document.createElement('iframe');

    // Init iframe
    iframe.setAttribute('id', 'myIframeId');
    iframe.addEventListener('load', () => {
      // @ts-expect-error : window
      initIAdvizeIframe(1, 'lc', iframe.contentWindow);
    });
    document.body.appendChild(iframe);

    // Init host
    initIAdvizeHost('myIframeId');

    resizeIFrame(iframe, { width: 400, height: 600, right: 0, bottom: 0 });

    expect(iframe.style.height).toEqual('600px');
    expect(iframe.style.width).toEqual('400px');
    expect(iframe.style.right).toEqual('0px');
    expect(iframe.style.bottom).toEqual('0px');
  });
  it('should reset iframe size on chatbox resize', () => {
    const iframe = document.createElement('iframe');

    // Init iframe
    iframe.setAttribute('id', 'myIframeId');
    iframe.addEventListener('load', () => {
      // @ts-expect-error : window
      initIAdvizeIframe(1, 'lc', iframe.contentWindow);
    });
    document.body.appendChild(iframe);

    // Init host
    initIAdvizeHost('myIframeId');

    resizeIFrame(iframe, { width: 0, height: 0, right: 0, bottom: 0 });

    expect(iframe.style.pointerEvents).toEqual('none');
    expect(iframe.style.width).toEqual('100vw');
    expect(iframe.style.height).toEqual('100vh');
  });
});
