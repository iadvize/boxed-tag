type IAdvizeInternalsParams = { method: string; args: unknown[] };

type IAdvizeInternals = Array<IAdvizeInternalsParams>;

type HostWindow = {
  iAdvizeInternals: IAdvizeInternals;
};

type IframePositioning = {
  width: number;
  height: number;
  left?: number;
  right?: number;
  bottom?: number;
};

const hostWindow = window as unknown as HostWindow;
hostWindow.iAdvizeInternals = [];

// URL forwarding
hostWindow.iAdvizeInternals.push({
  method: 'navigate',
  args: [window.location.href],
});

export function resizeIFrame(
  iAdvizeSandbox: HTMLIFrameElement,
  data: IframePositioning,
) {
  if (data.width !== undefined && data.height !== undefined) {
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

  iAdvizeSandbox.onload = () => {
    // Internal methods forwarding
    const buffer = [...hostWindow.iAdvizeInternals];
    hostWindow.iAdvizeInternals = Object.assign([], {
      push: ({ method, args }: IAdvizeInternalsParams): number => {
        iAdvizeSandbox.contentWindow!.postMessage(
          {
            command: 'internals',
            method,
            args,
          },
          '*',
        );
        return hostWindow.iAdvizeInternals.length;
      },
    });
    // Execute bufferized methods
    buffer.forEach((item) => hostWindow.iAdvizeInternals.push(item));

    // Send dimensions
    forwardWindowDimensions();
  };

  window.addEventListener('resize', forwardWindowDimensions);
  window.addEventListener('message', (e) => {
    if (e.source !== iAdvizeSandbox.contentWindow) {
      return;
    }
    resizeIFrame(iAdvizeSandbox, e.data);
  });
}
