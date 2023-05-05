import { CustomDataValues } from './shared/types';

type IAdvizeBoxedInterfaceParams = { method: string; args: unknown[] };

type IAdvizeBoxedInterface = Array<IAdvizeBoxedInterfaceParams>;

type HostWindow = {
  iAdvizeBoxedInterface: IAdvizeBoxedInterface;
};

type IframePositioning = {
  width: number;
  height: number;
  left?: number;
  right?: number;
  bottom?: number;
};

const hostWindow = window as unknown as HostWindow;
hostWindow.iAdvizeBoxedInterface = [];

// URL forwarding
hostWindow.iAdvizeBoxedInterface.push({
  method: 'navigate',
  args: [window.location.href],
});

export function resizeIFrame(
  iAdvizeSandbox: HTMLIFrameElement,
  data: IframePositioning,
) {
  const iframe = iAdvizeSandbox;
  const { width, height, left, right, bottom } = data;
  const shouldReset = width === 0 && height === 0;
  if (shouldReset) {
    iframe.style.pointerEvents = 'none';
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    return;
  }
  iframe.style.pointerEvents = 'inherit';
  iframe.style.width = `${width}px`;
  iframe.style.height = `${height}px`;
  iframe.style.bottom = `${bottom}px`;
  if (left) iframe.style.left = `${left}px`;
  else iframe.style.right = `${right}px`;
}

let observers: Record<string, MutationObserver> = {};
let listeners: Record<string, () => void> = {};

function observe(
  toObserve: Element,
  selector: string,
  callback: (values: CustomDataValues) => void,
) {
  // create an observer instance
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes, removedNodes, target }) => {
      // Find textContent mutation
      if (
        (addedNodes.length && addedNodes[0].nodeType === Node.TEXT_NODE) ||
        (removedNodes.length && removedNodes[0].nodeType === Node.TEXT_NODE)
      ) {
        callback({ [selector]: target.textContent });
      }
    });
  });

  observer.observe(toObserve, {
    childList: true,
  });
  observers[selector] = observer;
}

function listenInput(
  toListen: HTMLInputElement,
  selector: string,
  callback: (values: CustomDataValues) => void,
) {
  let oldValue = toListen.value;

  const listener = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (oldValue !== input.value) {
      callback({ [selector]: input.value });
      oldValue = input.value;
    }
  };
  toListen.addEventListener('input', listener);

  listeners[selector] = () => toListen.removeEventListener('input', listener);
}

function unObserve() {
  Object.values(observers).forEach((observer) => observer.disconnect());
  Object.values(listeners).forEach((removeListener) => removeListener());
  observers = {};
  listeners = {};
}

export function initIAdvizeHost(sandboxId: string): void {
  const iAdvizeSandbox = document.getElementById(
    sandboxId,
  ) as HTMLIFrameElement;

  if (!iAdvizeSandbox || iAdvizeSandbox.nodeName !== 'IFRAME') {
    throw new Error(`Could not find an iframe with the id "${sandboxId}"`);
  }

  // Auto-sizing and positionning of the iAdvize iframe
  function forwardWindowDimensions(): void {
    if (!iAdvizeSandbox.contentWindow) {
      return;
    }
    iAdvizeSandbox.contentWindow.postMessage(
      {
        hostWidth: window.innerWidth,
        hostHeight: window.innerHeight,
      },
      '*',
    );
  }

  function forwardCustomDataValues(customDataValues: CustomDataValues): void {
    if (!iAdvizeSandbox.contentWindow) {
      return;
    }
    iAdvizeSandbox.contentWindow.postMessage(
      {
        customDataValues,
      },
      '*',
    );
  }

  iAdvizeSandbox.onload = () => {
    // Internal methods forwarding
    const buffer = [...hostWindow.iAdvizeBoxedInterface];
    hostWindow.iAdvizeBoxedInterface = Object.assign([], {
      push: ({ method, args }: IAdvizeBoxedInterfaceParams): number => {
        iAdvizeSandbox.contentWindow!.postMessage(
          {
            command: 'internals',
            method,
            args,
          },
          '*',
        );
        return hostWindow.iAdvizeBoxedInterface.length;
      },
    });
    // Execute bufferized methods
    buffer.forEach((item) => hostWindow.iAdvizeBoxedInterface.push(item));

    // Send dimensions
    forwardWindowDimensions();
  };

  window.addEventListener('resize', forwardWindowDimensions);
  window.addEventListener(
    'message',
    ({ source, data: { width, height, customDataSelectors } }) => {
      if (source !== iAdvizeSandbox.contentWindow) {
        return;
      }

      if (width !== undefined && height !== undefined) {
        resizeIFrame(iAdvizeSandbox, { width, height });
      }

      if (customDataSelectors !== undefined) {
        customDataSelectors?.forEach((selector: string) => {
          const element = window.document.querySelector(selector);
          if ((<HTMLInputElement>element)?.value !== undefined) {
            listenInput(
              element as HTMLInputElement,
              selector,
              forwardCustomDataValues,
            );
          } else if (element) {
            observe(element, selector, forwardCustomDataValues);
          }
        });

        if (customDataSelectors.length === 0) {
          unObserve();
        }
      }
    },
  );
}
