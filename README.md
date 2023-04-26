# Sandboxed tag

The “iAdvize Sandboxed Tag” is a proposal to include the iAdvize Tag in the most secure way, ie. without it having access to the client’s website.

The iAdvize tag can be isolated when loaded from an iframe with the sandbox attribute.

This technique requires :

- A html page hosted on a different origin (but on the same top-level domain),
- A communication channel between the two pages, to handle navigation and the iframe positioning and sizing.

# Installation

## Install the lib on your project

```
npm i @iadvize-oss/sandboxed-tag
```

## Create the iframe script

Create a js file that will import the iframe script.
Then call `initIAdvizeIframe` to listen the host messages.
The `initIAdvizeIframe` comes with 2 arguments :

- `sid` : your iAdvize sid.
- `iAdvizePlatform` : the iadvize platform (default: ha).

```js
import { initIAdvizeIframe } from '@iadvize-oss/sandboxed-tag';

initIAdvizeIframe(<sid>, <iAdvizePlatform>);
```

## Add a sandboxed iframe

Add a sanboxed iframe on your site's main page.

```html
<iframe
  sandbox="allow-scripts allow-same-origin"
  src="https://my-iframe-script-url"
  id="myIframeId"
></iframe>
```

## Add the host script on your site's main page

Create a js file with the host lib import.
Then call `initIAdvizeHost` to listen the iframe messages.

```js
import { initIAdvizeHost } from '@iadvize-oss/sandboxed-tag';

initIAdvizeHost('myIframeId');
```

# Communication

## From iframe to host

Sending message from the isolated sanboxed iframe to the host window.
Use the `iAdvizeInterface` to add callbacks, that will be handled once the iadvize tag is loaded.

```js
window.iAdvizeInterface.push(function () {
  window.parent.postMessage({ foo: 'bar' });
});
```

Receiving message on the main host page.

```js
window.addEventListener('message', (e) => {
  if (e.data.foo) {
    // Do something with the data sent
  }
});
```

## From host to iframe

Sending message from the host window to the isolated sanboxed iframe.

```js
const iAdvizeSandbox = document.getElementById('myIframeId');

iAdvizeSandbox.onload = function () {
  iAdvizeSandbox.contentWindow.postMessage({ foo: 'bar' }, '*');
};
```

Receiving message on the iframe

```js
window.addEventListener('message', ({ data: { foo } }) => {
  // Do something with the data sent
});
```

## Call web SDK methods from host

Web SDK methods cannot be called from host context because the iAdvize tag is isolated in the iframe. So we need to tell the iframe what we want to call.  
After having called `initIAdvizeHost`, a `iAdvizeInternals` object is available in the host window context.  
This object sends the `method` name and `args` to the iframe, that will call the web SDK.

> **Warning** Because of the `postMessage` between host and the iframe, the arguments are stringified, thus function arguments cannot be passed.  
So `activate`, `logout`, `on`, `off` methods cannot be called.

example:

```js
// Init iAdvizeInternals
initIAdvizeHost('myIframeId');

// Navigate
window.iAdvizeInternals.push({
  method: 'navigate',
  args: [window.location.href],
});

// Get property
window.iAdvizeInternals.push({
  method: 'get',
  args: ['visitor:cookiesConsent'],
});

// Set property
window.iAdvizeInternals.push({
  method: 'set',
  args: ['visitor:GDPRConsent', true],
});
```

## Call web SDK methods from iframe

The web SDK methods can be called normally in the iframe window context.

example:

```js
// Activate
window.iAdvizeInterface.push((iAdvize) => {
  iAdvize.activate(() => ({
    authenticationOption: { type: 'ANONYMOUS' },
  }));
});

// On
window.iAdvizeInterface.push(function (iAdvize) {
  iAdvize.on('visitor:cookiesConsentChange', function (visitorCookiesConsent) {
    console.log(visitorCookiesConsent);
  });
});
```
