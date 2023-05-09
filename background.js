// Background Scripts

let currentIp = null;
let allowedIp = '0.0.0.0';
let watchingWebsite = 'binance.com';
let redirectWebsite = 'google.com';

// Get current client IP adress from cloudflare.
const updateIp = async () => {
  const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
  response.text().then(function (text) {
    const data = text
      .split('\n')
      .filter((el) => el.startsWith('ip'))[0]
      .replace('ip=', '');
    currentIp = data;
  });
};

// Get current client IP on Initial run.
updateIp();

// Fires on message come from popup script.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // Update current client IP.
  updateIp();
  sendResponse({ setMsg: 'IP Seted!' });
  if (request.newIp !== '') {
    allowedIp = request.newIp;
    console.log(`New ip is ${request.newIp}`);
  }
});

// Run on active tab change event.
chrome.tabs.onActivated.addListener(() => {
  updateIp();
});

// Fires on open new tab event.
chrome.tabs.onCreated.addListener((data) => {
  // Update current client IP.
  updateIp();
  // Get allowed IP from storage if available.
  chrome.storage.sync.get('ip', ({ ip }) => {
    if (ip) {
      console.log(`Allowed ip: ${ip}`);
      allowedIp = ip;
    } else chrome.storage.sync.set({ ip: allowedIp });
  });
});

// Run on every web request.
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (currentIp === allowedIp) return { cancel: false };
    else {
      return { redirectUrl: 'https://www.google.com/' };
    }
  },
  { urls: [`*://*.${watchingWebsite}/*`] },
  ['blocking']
);
