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
The `activate` and `on` methods can return a value to the host :  
to retrieve it, add a `window.addEventListener("message")` and check the `e.date.method` property to recognize the method called.

example:

```js
// Init iAdvizeInternals
initIAdvizeHost('myIframeId');

// Web SDK navigate
window.iAdvizeInternals.push({
  method: 'navigate',
  args: [window.location.href],
});

// Web SDK activate anonymous
window.iAdvizeInternals.push({
  method: 'activate',
  args: [
    JSON.stringify({
      authenticationOption: { type: 'ANONYMOUS' },
    }),
  ],
});

// Web SDK activate secured auth
const getToken = new Promise((resolve) => resolve('myToken'));
const visitor_token = await getToken(); // your backend logic to generate a JWE

window.iAdvizeInternals.push({
  method: 'activate',
  args: [
    JSON.stringify({
      authenticationOption: {
        type: 'SECURED_AUTHENTICATION',
        token: visitor_token,
      },
    }),
  ],
});

// Listen activate result
window.addEventListener('message', ({ data: { method, activation } }) => {
  if (method === 'activate') {
    console.log(activation); // activation return object : success or failure
  }
});

// Web SDK logout
window.iAdvizeInternals.push({
  method: 'logout',
});

// Listen logout
window.addEventListener('message', ({ data: { method } }) => {
  if (method === 'logout') {
    // Do something after logout
  }
});

// Web SDK on
window.iAdvizeInternals.push({
  method: 'on',
  args: ['cookiesConsentChanged'],
});

// Listen on cookiesConsentChanged result
window.addEventListener('message', ({ data: { method, value } }) => {
  if (method === 'on') {
    console.log(value); // cookiesConsentChanged value
  }
});

// Web SDK off
window.iAdvizeInternals.push({
  method: 'off',
  args: ['cookiesConsentChanged'],
});

// Web SDK set
window.iAdvizeInternals.push({
  method: 'set',
  args: ['visitor:GDPRConsent', true],
});

// Web SDK get
window.iAdvizeInternals.push({
  method: 'get',
  args: ['visitor:cookiesConsent'],
});
```
