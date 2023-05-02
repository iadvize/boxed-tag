type IAdvizeSandboxedInterfaceParams = { method: string; args: unknown[] };

type IAdvizeSandboxedInterface = Array<IAdvizeSandboxedInterfaceParams>;

type HostWindow = {
  iAdvizeSandboxedInterface: IAdvizeSandboxedInterface;
};

type IframePositioning = {
  width: number;
  height: number;
  left?: number;
  right?: number;
  bottom?: number;
};

const hostWindow = window as unknown as HostWindow;
hostWindow.iAdvizeSandboxedInterface = [];

// URL forwarding
hostWindow.iAdvizeSandboxedInterface.push({
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
    const buffer = [...hostWindow.iAdvizeSandboxedInterface];
    hostWindow.iAdvizeSandboxedInterface = Object.assign([], {
      push: ({ method, args }: IAdvizeSandboxedInterfaceParams): number => {
        iAdvizeSandbox.contentWindow!.postMessage(
          {
            command: 'internals',
            method,
            args,
          },
          '*',
        );
        return hostWindow.iAdvizeSandboxedInterface.length;
      },
    });
    // Execute bufferized methods
    buffer.forEach((item) => hostWindow.iAdvizeSandboxedInterface.push(item));

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
