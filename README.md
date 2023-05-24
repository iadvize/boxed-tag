# Boxed tag

The “iAdvize Boxed Tag” is a way to include the iAdvize Tag in the most secure way, without it having access to the client’s website.

With this solution, the iAdvize tag can be loaded in an isolated box (a sandboxed iframe).
This way, the main page context cannot be accessed by the iAdvize tag: the main page only sends controlled, relevant data to the boxed tag.

# Simple installation
This is the simplest way too add the iAdvize Boxed Tag to a website with the default configuration.

## 1 - Serve this HTML file

Serve a HTML file. We will use the name `iadvize-boxed-iframe.html`, but any name can be chosen.
This file needs to be served on the same top domain as the page it will be included in.
Replace `<your-sid>` with your own sid.

Ex : 
- Web page : https://hostpage.brand-domain.com
- Iframe : https://static.brand-domain.com/iadvize-boxed-iframe.html

```html
<!DOCTYPE html>
<html>
  <body>
   <script src="https://static.iadvize.com/boxed-tag/1.4.2/index.js" integrity="sha512-NS7M2FyNHaefJ42ilas6W+t/qJleeGTWIyhM2pj2Pn+t7PgWRH/HarBqV8HT+RFDi6JVS1ReAeF2Afz5dwpBjQ==" crossorigin="anonymous"></script>
    <script>
      window.iAdvizeBoxedTag.initIAdvizeIframe(<your-sid>, "halc");
    </script>
  </body>
</html>
```

## 2 - Add the following script

Add the following script (in your frontend code, or in your tag manager), replacing `https://static.brand-domain.com/iadvize-boxed-iframe.html` with the actual URL of the iframe : 

```javascript
// Change this URL with the actual URL of the iframe
const iAdvizeIframeUrl = "https://static.brand-domain.com/iadvize-boxed-iframe.html";

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
  }
`;
document.body.append(style);

const boxedTagScript = document.createElement("script");
boxedTagScript.src =
  "https://static.iadvize.com/boxed-tag/1.4.2/index.js";
boxedTagScript.integrity =
"sha512-NS7M2FyNHaefJ42ilas6W+t/qJleeGTWIyhM2pj2Pn+t7PgWRH/HarBqV8HT+RFDi6JVS1ReAeF2Afz5dwpBjQ==";
boxedTagScript.crossOrigin = "anonymous";

const iAdvizeSandboxedIframe = document.createElement("iframe");
iAdvizeSandboxedIframe.sandbox = "allow-scripts allow-same-origin allow-popups allow-forms";
iAdvizeSandboxedIframe.allow = "camera;microphone;autoplay";
iAdvizeSandboxedIframe.src = iAdvizeIframeUrl;
iAdvizeSandboxedIframe.id = "iAdvizeSandboxedIframe";
document.body.append(iAdvizeSandboxedIframe);

boxedTagScript.onload = function () {
  window.iAdvizeBoxedTag.initIAdvizeHost("iAdvizeSandboxedIframe");
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
The `initIAdvizeIframe` comes with 2 arguments :

- `sid` : your iAdvize sid.
- `iAdvizePlatform` : the iadvize platform (default: ha).

```js
import { initIAdvizeIframe } from '@iadvize-oss/boxed-tag';

initIAdvizeIframe(<sid>, <iAdvizePlatform>);
```

## Add a boxed iframe

Add a boxed iframe on your site's main page.

```html
<iframe
  title="iAdvize chat notification frame"
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
| allow-same-origin | Allows the iAdvize tag to access the host cookies and storages |
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

initIAdvizeHost('myIframeId');
```

# Communication
The only way to start a communication between the host and the sandboxed iframe is the `window.postMessage` method provided by the navigators (see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage).

> **warning**
> The postMessage data is serialized, so functions cannot be sent (see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#parameters).

Then, the target of the postMessage calls can listen to the events using `window.addEventListener('message')`.

> **warning**
> The source of the event should be checked to avoid conflicts and security concerns (see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#security_concerns).



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
window.addEventListener('message', ({ data: { method, activation } }) => {
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
window.addEventListener('message', ({ data: { method, activation } }) => {
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
// WebSDK on
window.iAdvizeBoxedInterface.push({
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
window.addEventListener('message', ({ data: { method, args, value } }) => {
  if (method === 'get' && args.includes('visitor:cookiesConsent')) {
    console.log(value); // cookiesConsent value
  }
});
```
