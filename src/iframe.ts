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
  args: {
    authenticationOption:
      | {
          type: 'ANONYMOUS_AUTHENTICATION';
        }
      | {
          type: 'SECURED_AUTHENTICATION';
          token: string;
        };
  };
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

type IAdvizeInterface = {
  config?: Record<string, unknown>;
  push: (callback: (iAdvize: IAdvizeGlobal) => void) => void;
} & Array<(iAdvize: IAdvizeGlobal) => void>;

type ExtendedWindow = Window & {
  iAdvizeInterface: IAdvizeInterface;
  host?: {
    width: number;
    height: number;
  };
};

const isInternal = (
  data: iAdvizeInterfaceParameters,
): data is iAdvizeInterfaceParametersInternals => data.command === 'internals';

const isActivate = (
  data: iAdvizeInterfaceParameters,
): data is iAdvizeInterfaceParametersActivate => data.method === 'activate';

const isLogout = (
  data: iAdvizeInterfaceParameters,
): data is iAdvizeInterfaceParametersLogout => data.method === 'logout';

const isOnOff = (
  data: iAdvizeInterfaceParameters,
): data is iAdvizeInterfaceParametersOn =>
  data.method === 'on' || data.method === 'off';

export function getActivateAuthToken(
  context: ExtendedWindow,
  targetOrigin = '*',
): Promise<string> {
  context.parent.postMessage(
    { command: 'internals', method: 'get-activate-auth-token' },
    targetOrigin,
  );

  return new Promise((resolve) => {
    // Listen once set-activate-auth-token from host. The listener is then removed.
    context.addEventListener(
      'message',
      ({ origin, data: { method, args: token } }) => {
        if (targetOrigin !== '*' && origin !== targetOrigin) {
          return;
        }
        if (method === 'set-activate-auth-token') {
          resolve(token);
        }
      },
      { once: true },
    );
  });
}

export function initIAdvizeIframe(
  websiteId: number,
  platform = 'ha',
  context = window as unknown as ExtendedWindow,
  targetOrigin = '*',
) {
  // iAdvize configuration
  context.iAdvizeInterface = context.iAdvizeInterface || [];
  context.iAdvizeInterface.config = {
    ...context.iAdvizeInterface.config,
    sid: websiteId,
    mode: 'sandboxed',
  };

  context.addEventListener(
    'message',
    ({
      origin,
      data,
    }: {
      origin: string;
      data: iAdvizeInterfaceParameters;
    }) => {
      if (targetOrigin !== '*' && origin !== targetOrigin) {
        return;
      }
      // Internal methods forwarding
      if (isActivate(data)) {
        const {
          command,
          method,
          args: {
            authenticationOption: { type },
          },
        } = data;
        context.iAdvizeInterface.push(async (iAdvize: IAdvizeGlobal) => {
          const activation = await iAdvize.activate(async () => {
            const token =
              type === 'SECURED_AUTHENTICATION'
                ? await getActivateAuthToken(context, targetOrigin)
                : null;
            return {
              authenticationOption: {
                type,
                token,
              },
            };
          });
          context.parent.postMessage(
            { command, method, activation },
            targetOrigin,
          );
        });
      } else if (isLogout(data)) {
        const { command, method } = data;
        context.iAdvizeInterface.push(async (iAdvize: IAdvizeGlobal) => {
          const logout = await iAdvize.logout();
          context.parent.postMessage({ command, method, logout }, targetOrigin);
        });
      } else if (isOnOff(data)) {
        const { command, method, args } = data;
        context.iAdvizeInterface.push((iAdvize: IAdvizeGlobal) =>
          iAdvize[method](...args, (value: unknown) =>
            context.parent.postMessage(
              { command, method, args, value },
              targetOrigin,
            ),
          ),
        );
      } else if (isInternal(data)) {
        const { command, method, args } = data;

        context.iAdvizeInterface.push((iAdvize: IAdvizeGlobal) => {
          const value = iAdvize[method](...args);
          context.parent.postMessage(
            { command, method, args, value },
            targetOrigin,
          );
        });
      }

      // Sharing the main context dimension, for sizing and positionning
      const { hostWidth, hostHeight } = data;
      if (hostWidth && hostHeight) {
        context.host = {
          width: hostWidth,
          height: hostHeight,
        };
      }
    },
  );

  context.iAdvizeInterface.push(function (iAdvize: IAdvizeGlobal) {
    // Chatbox sizing
    iAdvize.on('app:boundariesChange', (boundaries: unknown) => {
      context.parent.postMessage(boundaries, targetOrigin);
    });
  });

  // Script insertion
  const script = document.createElement('script');
  script.src = `//${platform}.iadvize.com/iadvize.js`;
  document.body.appendChild(script);
}
