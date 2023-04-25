type IAdvizeInternalsParams = { method: string; args: unknown[] };

type IAdvizeInternals = Array<IAdvizeInternalsParams>;

type HostWindow = {
  iAdvizeInternals: IAdvizeInternals;
};

const hostWindow = window as unknown as HostWindow;
hostWindow.iAdvizeInternals = [];

// URL forwarding
hostWindow.iAdvizeInternals.push({
  method: 'navigate',
  args: [window.location.href],
});

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
    if (e.data.width !== undefined && e.data.height !== undefined) {
      const { width, height, left, right, bottom } = e.data;
      const shouldReset = width === 0 && height === 0;
      if (shouldReset) {
        iAdvizeSandbox.style.pointerEvents = 'none';
        iAdvizeSandbox.style.width = '100vw';
        iAdvizeSandbox.style.height = '100vh';
        return;
      }
      iAdvizeSandbox.style.pointerEvents = 'inherit';
      iAdvizeSandbox.style.width = `${width}px`;
      iAdvizeSandbox.style.height = `${height}px`;
      iAdvizeSandbox.style.bottom = `${bottom}px`;
      if (left) iAdvizeSandbox.style.left = `${left}px`;
      else iAdvizeSandbox.style.right = `${right}px`;
    }
  });
}
