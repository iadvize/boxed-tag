/*
 * Web SDK methods examples
 */

// Web SDK navigate
window.iAdvizeBoxedInterface.push({
  method: 'navigate',
  args: [window.location.href],
});

// Web SDK activate anonymous
window.iAdvizeBoxedInterface.push({
  method: 'activate',
  args: {
    authenticationOption: { type: 'ANONYMOUS' },
  },
});

// Web SDK activate secured auth
const getJweToken = Promise.resolve('myJWEToken'); // your backend logic to generate a JWE token
window.iAdvizeBoxedInterface.push({
  method: 'activate',
  args: {
    authenticationOption: {
      type: 'SECURED_AUTHENTICATION',
    },
  },
});

// Listen to activate result
window.addEventListener('message', ({ data: { method, activation }, origin }) => {
  if (origin !== "https://myIframeUrl") return;

  if (method === 'activate') {
    console.log(activation); // activation return object : success or failure
  }
  if (method === 'get-activate-auth-token') {
    getJweToken().then((token) =>
      window.iAdvizeBoxedInterface.push({
        method: 'set-activate-auth-token',
        args: `${token}`,
      }),
    );
  }
});

// Web SDK logout
window.iAdvizeBoxedInterface.push({
  method: 'logout',
});

// Listen to logout
window.addEventListener('message', ({ data: { method }, origin }) => {
  if (origin !== "https://myIframeUrl") return;

  if (method === 'logout') {
    // Do something after logout
  }
});

// Web SDK on
window.iAdvizeBoxedInterface.push({
  method: 'on',
  args: ['visitor:cookiesConsentChanged'],
});

// Listen to cookiesConsentChanged result
window.addEventListener('message', ({ data: { method, args, value }, origin }) => {
  if (origin !== "https://myIframeUrl") return;

  if (method === 'on' && args.includes('visitor:cookiesConsentChanged')) {
    console.log(value); // cookiesConsentChanged value
  }
});

// Web SDK off
window.iAdvizeBoxedInterface.push({
  method: 'off',
  args: ['visitor:cookiesConsentChanged'],
});

// Web SDK set
window.iAdvizeBoxedInterface.push({
  method: 'set',
  args: ['visitor:GDPRConsent', true],
});

// Web SDK get
window.iAdvizeBoxedInterface.push({
  method: 'get',
  args: ['visitor:cookiesConsent'],
});

// Listen to cookiesConsent get
window.addEventListener('message', ({ data: { method, args, value }, origin }) => {
  if (origin !== "https://myIframeUrl") return;

  if (method === 'get' && args.includes('visitor:cookiesConsent')) {
    console.log(value); // cookiesConsent value
  }
});
