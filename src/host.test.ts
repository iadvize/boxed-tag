/* eslint-disable @typescript-eslint/no-explicit-any */
import { initIAdvizeHost, resizeIFrame } from './host';
import { initIAdvizeIframe } from './iframe';

describe('host', () => {
  beforeEach(() => {
    (window as any).iAdvizeBoxedInterface = [];
  });
  afterEach(() => {
    document.querySelector('iframe')?.remove();
  });
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
      const win = iframe.contentWindow as any;
      win.iAdvizeInterface = [];
      win.iAdvizeInterface.config = {
        sid: 1,
      };
      initIAdvizeIframe(1, 'lc', win, '*');

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
    initIAdvizeHost('myIframeId', '*');

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
          (window as any).iAdvizeBoxedInterface.push({
            method: 'set-activate-auth-token',
            args: `myToken`,
          });
        }
        if (
          method === 'activate' &&
          activation?.authenticationOption?.type === 'SECURED_AUTHENTICATION'
        ) {
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
      const win = iframe.contentWindow as any;
      win.iAdvizeInterface = [];
      win.iAdvizeInterface.config = {
        sid: 1,
      };
      initIAdvizeIframe(1, 'lc', win, '*');
    });
    document.body.appendChild(iframe);

    // Init host
    initIAdvizeHost('myIframeId', '*');

    window.innerWidth = 400;
    window.innerHeight = 600;
    window.dispatchEvent(new CustomEvent('resize'));

    setTimeout(() => {
      expect(iframe.contentWindow?.host?.height).toEqual(600);
      expect(iframe.contentWindow?.host?.width).toEqual(400);
      done();
    }, 1000);
  });
  it('should resize iframe: right positioning', (done) => {
    const iframe = document.createElement('iframe');

    // Init iframe
    iframe.setAttribute('id', 'myIframeId');
    iframe.addEventListener('load', () => {
      const win = iframe.contentWindow as any;
      win.iAdvizeInterface = [];
      win.iAdvizeInterface.config = {
        sid: 1,
      };
      initIAdvizeIframe(1, 'lc', win, '*');
    });
    document.body.appendChild(iframe);

    // Init host
    initIAdvizeHost('myIframeId', '*');

    resizeIFrame(iframe, {
      width: 400,
      height: 600,
      right: 0,
      bottom: 0,
    });

    setTimeout(() => {
      expect(iframe.style.height).toEqual('600px');
      expect(iframe.style.width).toEqual('400px');
      expect(iframe.style.right).toEqual('0px');
      expect(iframe.style.bottom).toEqual('0px');
      done();
    });
  });
  it('should resize iframe: left positioning', (done) => {
    const iframe = document.createElement('iframe');

    // Init iframe
    iframe.setAttribute('id', 'myIframeId');
    iframe.addEventListener('load', () => {
      const win = iframe.contentWindow as any;
      win.iAdvizeInterface = [];
      win.iAdvizeInterface.config = {
        sid: 1,
      };
      initIAdvizeIframe(1, 'lc', win, '*');
    });
    document.body.appendChild(iframe);

    // Init host
    initIAdvizeHost('myIframeId', '*');

    resizeIFrame(iframe, {
      width: 400,
      height: 600,
      left: 0,
      bottom: 0,
    });

    setTimeout(() => {
      expect(iframe.style.height).toEqual('600px');
      expect(iframe.style.width).toEqual('400px');
      expect(iframe.style.left).toEqual('0px');
      expect(iframe.style.bottom).toEqual('0px');
      done();
    });
  });
  it('should reset iframe size on chatbox resize', (done) => {
    const iframe = document.createElement('iframe');

    // Init iframe
    iframe.setAttribute('id', 'myIframeId');
    iframe.addEventListener('load', () => {
      const win = iframe.contentWindow as any;
      win.iAdvizeInterface = [];
      win.iAdvizeInterface.config = {
        sid: 1,
      };
      initIAdvizeIframe(1, 'lc', win, '*');
    });
    document.body.appendChild(iframe);

    // Init host
    initIAdvizeHost('myIframeId', '*');

    resizeIFrame(iframe, { width: 0, height: 0, right: 0, bottom: 0 });

    setTimeout(() => {
      expect(iframe.style.pointerEvents).toEqual('none');
      expect(iframe.style.width).toEqual('100vw');
      expect(iframe.style.height).toEqual('100vh');
      done();
    });
  });
  it('should handle logout command', (done) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('id', 'logoutIframe');
    const logoutMock = jest.fn().mockResolvedValue('logout success');

    const onMessage = () => {
      expect(logoutMock).toHaveBeenCalledWith();
      window.removeEventListener('message', onMessage);
      done();
    };
    window.addEventListener('message', onMessage);

    iframe.addEventListener('load', () => {
      const win = iframe.contentWindow as any;
      win.iAdvizeInterface = [];
      initIAdvizeIframe(1, 'lc', win, '*');
      setTimeout(() => {
        win.iAdvizeInterface.forEach((fn: any) =>
          fn({ logout: logoutMock, on: jest.fn() }),
        );
      }, 200);
    });
    document.body.appendChild(iframe);
    initIAdvizeHost('logoutIframe', '*');

    window.iAdvizeBoxedInterface.push({ method: 'logout', args: [] });
  });
  it('should handle anonymous activation', (done) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('id', 'anonymousIframe');
    const activateMock = jest.fn().mockImplementation((cb) => cb());

    const onMessage = (e: MessageEvent) => {
      expect(e.data.method).toBe('activate');
      expect(e.data.activation.authenticationOption.type).toBe(
        'ANONYMOUS_AUTHENTICATION',
      );
      window.removeEventListener('message', onMessage);
      done();
    };
    window.addEventListener('message', onMessage);

    iframe.addEventListener('load', () => {
      const win = iframe.contentWindow as any;
      win.iAdvizeInterface = [];
      initIAdvizeIframe(1, 'lc', win, '*');
      setTimeout(() => {
        win.iAdvizeInterface.forEach((fn: any) =>
          fn({ activate: activateMock, on: jest.fn() }),
        );
      }, 200);
    });
    document.body.appendChild(iframe);
    initIAdvizeHost('anonymousIframe', '*');

    window.iAdvizeBoxedInterface.push({
      method: 'activate',
      args: { authenticationOption: { type: 'ANONYMOUS_AUTHENTICATION' } },
    });
  });
  it('should ignore host messages from incorrect origin', (done) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('id', 'originHostIframe');

    document.body.appendChild(iframe);
    initIAdvizeHost('originHostIframe', 'https://correct-origin.com');

    // We check if the iframe styles changed instead of mocking.
    iframe.style.width = '10px';

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://wrong-origin.com',
        data: { width: 100, height: 100 },
        source: iframe.contentWindow,
      }),
    );

    setTimeout(() => {
      expect(iframe.style.width).toBe('10px');
      done();
    }, 100);
  });
  it('should ignore iframe messages from incorrect origin', (done) => {
    const win = {
      addEventListener: jest.fn(),
      parent: { postMessage: jest.fn() },
      iAdvizeInterface: [],
      document: {
        createElement: () => ({ src: '' }),
        body: { appendChild: jest.fn() },
      },
    } as any;

    initIAdvizeIframe(1, 'lc', win, 'https://correct-origin.com');

    const messageHandler = win.addEventListener.mock.calls.find(
      (call: any) => call[0] === 'message',
    )[1];

    messageHandler({
      origin: 'https://wrong-origin.com',
      data: { command: 'internals', method: 'logout' },
    });

    setTimeout(() => {
      // initIAdvizeIframe pushes 1 callback for app:boundariesChange
      expect(win.iAdvizeInterface).toHaveLength(1);
      done();
    }, 100);
  });
});
