/*
 * Web SDK methods examples
 */

// Web SDK navigate
window.iAdvizeSandboxedInterface.push({
  method: 'navigate',
  args: [window.location.href],
});

// Web SDK activate anonymous
window.iAdvizeSandboxedInterface.push({
  method: 'activate',
  args: {
    authenticationOption: { type: 'ANONYMOUS' },
  },
});

// Web SDK activate secured auth
const getToken = new Promise((resolve) => resolve('myToken'));
const visitor_token = await getToken(); // your backend logic to generate a JWE

window.iAdvizeSandboxedInterface.push({
  method: 'activate',
  args: {
    authenticationOption: {
      type: 'SECURED_AUTHENTICATION',
      token: visitor_token,
    },
  },
});

// Listen to activate result
window.addEventListener('message', ({ data: { method, activation } }) => {
  if (method === 'activate') {
    console.log(activation); // activation return object : success or failure
  }
});

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

// Web SDK off
window.iAdvizeSandboxedInterface.push({
  method: 'off',
  args: ['visitor:cookiesConsentChanged'],
});

// Web SDK set
window.iAdvizeSandboxedInterface.push({
  method: 'set',
  args: ['visitor:GDPRConsent', true],
});

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
