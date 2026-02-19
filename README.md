# Boxed tag

The “iAdvize Boxed Tag” is a way to include the iAdvize Tag in the most secure way, without it having access to the client’s website.

With this solution, the iAdvize tag can be loaded in an isolated box (a sandboxed iframe).
This way, the main page context cannot be accessed by the iAdvize tag: the main page only sends controlled, relevant data to the boxed tag.

# Security Requirements

To ensure the security of the integration, the following requirements must be met:

1.  **Origin Isolation:** The `iframe` HTML file **MUST** be served from a different subdomain (e.g., `chat.brand-domain.com`) than your main website (e.g., `www.brand-domain.com`). Serving them on the same origin with `allow-same-origin` negates the sandbox protection.
2.  **CSP Headers:** The iframe file should be served with the following Content Security Policy header to prevent it from being embedded by unauthorized sites:
    ```http
    Content-Security-Policy: frame-ancestors 'self' https://www.brand-domain.com;
    ```
3.  **Strict Origin Checks:** The `initIAdvizeHost` and `initIAdvizeIframe` functions now require the `targetOrigin` parameter to be set to the specific origin of the other party. Do not use `*` unless absolutely necessary and you understand the security implications.

# Simple installation
This is the simplest way too add the iAdvize Boxed Tag to a website with the default configuration.

## 1 - Serve this HTML file

Serve a HTML file. We will use the name `iadvize-boxed-iframe.html`, but any name can be chosen.
This file needs to be served on a **different subdomain** than the page it will be included in.
Replace `<your-sid>` with your own sid.

Ex :
- Web page : https://www.brand-domain.com
- Iframe : https://chat.brand-domain.com/iadvize-boxed-iframe.html

```html
<!DOCTYPE html>
<html>
  <body>
   <script src="https://static.iadvize.com/boxed-tag/1.4.4/index.js" integrity="sha512-NS7M2FyNHaefJ42ilas6W+t/qJleeGTWIyhM2pj2Pn+t7PgWRH/HarBqV8HT+RFDi6JVS1ReAeF2Afz5dwpBjQ==" crossorigin="anonymous"></script>
    <script>
      window.iAdvizeInterface = window.iAdvizeInterface || [];
      window.iAdvizeInterface.config = {
        sid: <your-sid>,
        allowedCookieDomains: ['chat.brand-domain.com']
      };
      // SECURITY: Define the strict origin of the host page
      const hostOrigin = "https://www.brand-domain.com";
      window.iAdvizeBoxedTag.initIAdvizeIframe("halc", hostOrigin);
    </script>
  </body>
</html>
```

## 2 - Add the following script

Add the following script (in your frontend code, or in your tag manager), replacing `https://chat.brand-domain.com/iadvize-boxed-iframe.html` with the actual URL of the iframe :

```javascript
// Change this URL with the actual URL of the iframe
const iAdvizeIframeUrl = "https://chat.brand-domain.com/iadvize-boxed-iframe.html";
// SECURITY: Define the strict origin of the iframe
const targetOrigin = "https://chat.brand-domain.com";

const style = document.createElement("style");
style.innerHTML = `
  #iAdvizeSandboxedIframe {
    border: none;
    position: fixed;
    bottom: 0;
    right: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 2147483647;
  }
`;
document.body.append(style);

const boxedTagScript = document.createElement("script");
boxedTagScript.src =
  "https://static.iadvize.com/boxed-tag/1.4.4/index.js";
boxedTagScript.integrity =
"sha512-NS7M2FyNHaefJ42ilas6W+t/qJleeGTWIyhM2pj2Pn+t7PgWRH/HarBqV8HT+RFDi6JVS1ReAeF2Afz5dwpBjQ==";
boxedTagScript.crossOrigin = "anonymous";

const iAdvizeSandboxedIframe = document.createElement("iframe");
iAdvizeSandboxedIframe.sandbox = "allow-scripts allow-same-origin allow-popups allow-forms";
iAdvizeSandboxedIframe.allow = "camera;microphone;autoplay";
iAdvizeSandboxedIframe.referrerPolicy = "origin";
iAdvizeSandboxedIframe.src = iAdvizeIframeUrl;
iAdvizeSandboxedIframe.id = "iAdvizeSandboxedIframe";
document.body.append(iAdvizeSandboxedIframe);

boxedTagScript.onload = function () {
  window.iAdvizeBoxedTag.initIAdvizeHost("iAdvizeSandboxedIframe", targetOrigin);
};

document.body.append(boxedTagScript);
```

# Advanced installation
This is a more advanced installation, allowing :
- a custom configuration,
- the use of WebSDK methods (see https://developers.iadvize.com/documentation/javascript-web-sdk#javascript-web-sdk).

## Install the lib on your project

```
npm install @iadvize-oss/boxed-tag
```

## Create the iframe script

Create a js file that will import the iframe script.
Then call `initIAdvizeIframe` to listen the host messages.
The `initIAdvizeIframe` comes with arguments :

- `iAdvizePlatform` : the iadvize platform (default: ha).
- `targetOrigin` : the origin of the host page.

```js
import { initIAdvizeIframe } from '@iadvize-oss/boxed-tag';

window.iAdvizeInterface = window.iAdvizeInterface || [];
window.iAdvizeInterface.config = {
  sid: <sid>,
};

const iAdvizePlatform = 'halc';
const hostOrigin = 'https://www.brand-domain.com';

initIAdvizeIframe(iAdvizePlatform, hostOrigin);
```

## Add a boxed iframe

Add a boxed iframe on your site's main page.

```html
<iframe
  title="iAdvize chat notification frame"
  referrerpolicy="origin"
  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
  allow="camera;microphone;autoplay"
  src="https://my-iframe-script-url"
  id="myIframeId"
></iframe>
```
The iframe is set with the following sandbox parameters:
| sandbox param     | description                                                    |
|-------------------|----------------------------------------------------------------|
| allow-scripts     | Allows the page to run iAdvize tag script.                     |
| allow-same-origin | Allows the iAdvize tag to maintain its unique origin in the iframe (instead of null) and access its own internal cookies/storage |
| allow-popups      | Allows the iAdvize tag to open links sent by the agent         |
| allow-forms       | Allows the iAdvize tag to submit the visitor email if needed   |

And the following allow parameters:
| allow param       | description                                                             |
|-------------------|-------------------------------------------------------------------------|
| camera            | Allows the boxed tag to ask the camera permission (for video calls)     |
| microphone        | Allows the boxed tag to ask the microphone permission (for video calls) |
| autoplay          | Allows the boxed tag to launch the video stream automatically           |

## Add the host script on your site's main page

Create a js file with the host lib import, then call `initIAdvizeHost` to listen to the iframe messages.

```js
import { initIAdvizeHost } from '@iadvize-oss/boxed-tag';

const iframeOrigin = 'https://chat.brand-domain.com';
initIAdvizeHost('myIframeId', iframeOrigin);
```

# Communication
The only way to start a communication between the host and the sandboxed iframe is the `window.postMessage` method provided by the navigators (see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage).

> **warning**
> The postMessage data is serialized, so functions cannot be sent (see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#parameters).

Then, the target of the postMessage calls can listen to the events using `window.addEventListener('message')`.

> **🚨 SECURITY CRITICAL**
>
> 1.  **Verify Origins:** You **MUST** check `event.origin` in all `message` event listeners. Do not assume messages come from your own iframe/parent.
> 2.  **Restrict Targets:** When sending messages (including JWE tokens), replace `*` with the specific string URL of the recipient (e.g., `postMessage(data, "https://chat.brand-domain.com")`). **Never use `*` for messages containing tokens.**


## Call iAdvize WebSDK methods from host

WebSDK methods cannot be called from the host context because the iAdvize tag is isolated in the iframe : we need to communicate to the iframe what we want to call.

After having called `initIAdvizeHost`, a `iAdvizeBoxedInterface` object is available in the host window context.
This object sends the `method` name and `args` to the iframe, that will call the webSDK.
The `activate`, `get` and `on` methods can return a value to the host :
to retrieve it, add a `window.addEventListener("message")` and check the `e.data.method` property to recognize the method called.

### Navigate
```js
// WebSDK navigate
window.iAdvizeBoxedInterface.push({
  method: 'navigate',
  args: [window.location.href],
});
```

### Activate
The host can listen to the result of the `activate` call.

For an anonymous authentication:

```js
// WebSDK activate anonymous
window.iAdvizeBoxedInterface.push({
  method: 'activate',
  args: {
    authenticationOption: { type: 'ANONYMOUS' },
  },
});

// Listen to activate result
window.addEventListener('message', ({ origin, data: { method, activation } }) => {
  if (origin !== "https://chat.brand-domain.com") return; // Security check

  if (method === 'activate') {
    console.log(activation); // activation return object : success or failure
  }
});
```

For a secured authentication, the JWE token should be generated on the host side and sent to the iframe :
 - the host should listen a `get-activate-auth-token` message initiated by the iframe.
 - the backend api then gets the JWE token,
 - the token is then sent to the iframe inside a `set-activate-auth-token` message.

The `get-activate-auth-token` listener allows the iframe to ask for a token refresh if needed.

Example of secured authentication implementation:
```js
// WebSDK activate secured auth
const getJweToken = Promise.resolve('myJWEToken');// your backend logic to generate a JWE

window.iAdvizeBoxedInterface.push({
  method: 'activate',
  args: {
    authenticationOption: {
      type: 'SECURED_AUTHENTICATION',
    },
  },
});

// Listen to activate result
window.addEventListener('message', ({ origin, data: { method, activation } }) => {
  if (origin !== "https://chat.brand-domain.com") return; // Security check

  // Handle authentication token
  if (method === 'get-activate-auth-token') {
    getJweToken().then((token) =>
      window.iAdvizeBoxedInterface.push({
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
// WebSDK logout
window.iAdvizeBoxedInterface.push({
  method: 'logout',
});

// Listen to logout
window.addEventListener('message', ({ origin, data: { method } }) => {
  if (origin !== "https://chat.brand-domain.com") return; // Security check

  if (method === 'logout') {
    // Do something after logout
  }
});
```

### On
The host can listen to the result of the `on` call.

Example of implementation:
```js
// WebSDK on
window.iAdvizeBoxedInterface.push({
  method: 'on',
  args: ['visitor:cookiesConsentChanged'],
});

// Listen to cookiesConsentChanged result
window.addEventListener('message', ({ origin, data: { method, args, value } }) => {
  if (origin !== "https://chat.brand-domain.com") return; // Security check

  if (method === 'on' && args.includes('visitor:cookiesConsentChanged')) {
    console.log(value); // cookiesConsentChanged value
  }
});
```

### Off
```js
// WebSDK off
window.iAdvizeBoxedInterface.push({
  method: 'off',
  args: ['visitor:cookiesConsentChanged'],
});
```
### Set
```js
// WebSDK set
window.iAdvizeBoxedInterface.push({
  method: 'set',
  args: ['visitor:GDPRConsent', true],
});
```
### Get
The host can listen to the result of the `get` call.

Example of implementation:
```js
// WebSDK get
window.iAdvizeBoxedInterface.push({
  method: 'get',
  args: ['visitor:cookiesConsent'],
});

// Listen to cookiesConsent get
window.addEventListener('message', ({ origin, data: { method, args, value } }) => {
  if (origin !== "https://chat.brand-domain.com") return; // Security check

  if (method === 'get' && args.includes('visitor:cookiesConsent')) {
    console.log(value); // cookiesConsent value
  }
});
```
