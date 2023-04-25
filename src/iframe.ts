type IAdvizeGlobal = {
  [key: string]: Function;
};

export function initIAdvizeIframe(websiteId: number, platform = 'ha') {
  // iAdvize configuration
  window.iAdvizeInterface = window.iAdvizeInterface || [];
  window.iAdvizeInterface.config = {
    sid: websiteId,
    mode: 'sandboxed',
  };

  window.addEventListener(
    'message',
    ({ data: { command, method, args, hostHeight, hostWidth } }) => {
      // Internal methods forwarding
      if (command === 'internals') {
        window.iAdvizeInterface.push((iAdvize: IAdvizeGlobal) =>
          iAdvize[method](...args),
        );
      }

      // Sharring the main window dimension, for sizing and positionning
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
