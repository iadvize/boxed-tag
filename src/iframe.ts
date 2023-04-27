type IAdvizeGlobal = {
  [key: string]: Function;
};

type iAdvizeInterfaceParameters = {
  command: string;
  method: string;
  args: unknown;
  hostHeight: number;
  hostWidth: number;
};

type iAdvizeInterfaceParametersInternals = {
  command: 'internals';
  method: string;
  args: Array<string | object | boolean | number>;
} & iAdvizeInterfaceParameters;

type iAdvizeInterfaceParametersActivate = {
  command: 'internals';
  method: 'activate';
  args: Record<string, unknown>;
} & iAdvizeInterfaceParameters;

type iAdvizeInterfaceParametersLogout = {
  command: 'internals';
  method: 'logout';
  arg: undefined;
} & iAdvizeInterfaceParameters;

type iAdvizeInterfaceParametersOn = {
  command: 'internals';
  method: 'on' | 'off';
  args: Array<string>;
} & iAdvizeInterfaceParameters;

const isInternal = (
  data: iAdvizeInterfaceParameters,
): data is iAdvizeInterfaceParametersInternals => data.command === 'internals';

const isActivate = (
  data: iAdvizeInterfaceParameters,
): data is iAdvizeInterfaceParametersActivate => data.method === 'activate';

const isLogout = (
  data: iAdvizeInterfaceParameters,
): data is iAdvizeInterfaceParametersLogout => data.method === 'logout';

const isOn = (
  data: iAdvizeInterfaceParameters,
): data is iAdvizeInterfaceParametersOn =>
  data.method === 'on' || data.method === 'off';

export function initIAdvizeIframe(websiteId: number, platform = 'ha') {
  // iAdvize configuration
  window.iAdvizeInterface = window.iAdvizeInterface || [];
  window.iAdvizeInterface.config = {
    sid: websiteId,
    mode: 'sandboxed',
  };

  window.addEventListener(
    'message',
    ({ data }: { data: iAdvizeInterfaceParameters }) => {
      // Internal methods forwarding
      if (isInternal(data)) {
        const { method, args } = data;
        window.iAdvizeInterface.push((iAdvize: IAdvizeGlobal) =>
          iAdvize[method](...args),
        );
      }

      if (isActivate(data)) {
        const { command, method, args } = data;
        window.iAdvizeInterface.push(async (iAdvize: IAdvizeGlobal) => {
          const activation = await iAdvize.activate(() => args);
          window.parent.postMessage({ command, method, activation }, '*');
        });
      }

      if (isLogout(data)) {
        const { command, method } = data;
        window.iAdvizeInterface.push(async (iAdvize: IAdvizeGlobal) => {
          const logout = await iAdvize.logout();
          window.parent.postMessage({ command, method, logout }, '*');
        });
      }

      if (isOn(data)) {
        const { command, method, args } = data;
        window.iAdvizeInterface.push((iAdvize: IAdvizeGlobal) =>
          iAdvize[method](...args, (value: unknown) =>
            window.parent.postMessage({ command, method, value }, '*'),
          ),
        );
      }

      // Sharing the main window dimension, for sizing and positionning
      const { hostWidth, hostHeight } = data;
      if (hostWidth && hostHeight) {
        window.host = {
          width: hostWidth,
          height: hostHeight,
        };
      }
    },
  );

  window.iAdvizeInterface.push(function (iAdvize: IAdvizeGlobal) {
    // Chatbox sizing
    iAdvize.on('app:boundariesChange', (boundaries: unknown) => {
      window.parent.postMessage(boundaries, '*');
    });
  });

  // Script insertion
  const script = document.createElement('script');
  script.src = `//${platform}.iadvize.com/iadvize.js`;
  document.body.appendChild(script);
}
