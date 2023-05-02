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
After having called `initIAdvizeHost`, a `iAdvizeSandboxedInterface` object is available in the host window context.  
This object sends the `method` name and `args` to the iframe, that will call the web SDK.
The `activate` and `get` and `on` methods can return a value to the host :  
to retrieve it, add a `window.addEventListener("message")` and check the `e.data.method` property to recognize the method called.

### Navigate
```js
// Web SDK navigate
window.iAdvizeSandboxedInterface.push({
  method: 'navigate',
  args: [window.location.href],
});
```

### Activate
The host can listen to the result of the `activate` call.

For an anonymous authentication: 

```js
// Web SDK activate anonymous
window.iAdvizeSandboxedInterface.push({
  method: 'activate',
  args: {
    authenticationOption: { type: 'ANONYMOUS' },
  },
});

// Listen to activate result
window.addEventListener('message', ({ data: { method, activation } }) => {
  if (method === 'activate') {
    console.log(activation); // activation return object : success or failure
  }
});
```

For a secured authentication:  
The JWE token should be generated on the host side and sent to the iframe. 
 - The host should listen a `get-activate-auth-token` message initiated by the iframe.
 - Then call your backend api to get the JWE token,
 - Then send the token to the iframe as a `set-activate-auth-token` message.

The `get-activate-auth-token` listener allows the iframe to ask for a token refresh if needed.

Example of secured authentication implementation : 
```js
// Web SDK activate secured auth
const getJweToken = Promise.resolve('myJWEToken');// your backend logic to generate a JWE

window.iAdvizeSandboxedInterface.push({
  method: 'activate',
  args: {
    authenticationOption: {
      type: 'SECURED_AUTHENTICATION',
    },
  },
});

// Listen to activate result
window.addEventListener('message', ({ data: { method, activation } }) => {
  // Handle authentication token
  if (method === 'get-activate-auth-token') {
    getJweToken().then((token) =>
      window.iAdvizeSandboxedInterface.push({
        method: 'set-activate-auth-token',
        args: `${token}`,
      }),
    );
  }
  if (method === 'activate') {
    console.log(activation); // activation return object : success or failure
  }
});

```

### Logout
The host can listen to the result of the `logout` call.

Example of implementation:
```js
// Web SDK logout
window.iAdvizeSandboxedInterface.push({
  method: 'logout',
});

// Listen to logout
window.addEventListener('message', ({ data: { method } }) => {
  if (method === 'logout') {
    // Do something after logout
  }
});
```

### On
The host can listen to the result of the `on` call.

Example of implementation:
```js
// Web SDK on
window.iAdvizeSandboxedInterface.push({
  method: 'on',
  args: ['visitor:cookiesConsentChanged'],
});

// Listen to cookiesConsentChanged result
window.addEventListener('message', ({ data: { method, args, value } }) => {
  if (method === 'on' && args.includes('visitor:cookiesConsentChanged')) {
    console.log(value); // cookiesConsentChanged value
  }
});
```

### Off
```js
// Web SDK off
window.iAdvizeSandboxedInterface.push({
  method: 'off',
  args: ['visitor:cookiesConsentChanged'],
});
```
### Set
```js
### Set
// Web SDK set
window.iAdvizeSandboxedInterface.push({
  method: 'set',
  args: ['visitor:GDPRConsent', true],
});
```
### Get
The host can listen to the result of the `get` call.

Example of implementation:
```js
// Web SDK get
window.iAdvizeSandboxedInterface.push({
  method: 'get',
  args: ['visitor:cookiesConsent'],
});

// Listen to cookiesConsent get
window.addEventListener('message', ({ data: { method, args, value } }) => {
  if (method === 'get' && args.includes('visitor:cookiesConsent')) {
    console.log(value); // cookiesConsent value
  }
});
```
