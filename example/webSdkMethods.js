/*
 * Web SDK methods examples
 */

// Web SDK navigate
window.iAdvizeInternals.push({
  method: 'navigate',
  args: [window.location.href],
});

// Web SDK activate anonymous
window.iAdvizeInternals.push({
  method: 'activate',
  args: {
    authenticationOption: { type: 'ANONYMOUS' },
  },
});

// Web SDK activate secured auth
const getToken = new Promise((resolve) => resolve('myToken'));
const visitor_token = await getToken(); // your backend logic to generate a JWE

window.iAdvizeInternals.push({
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
window.iAdvizeInternals.push({
  method: 'logout',
});

// Listen to logout
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

// Listen to cookiesConsentChanged result
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
