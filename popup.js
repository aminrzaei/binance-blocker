// Popup Page Scripts

const ipBtn = document.querySelector('#setIpBtn');
const ipInput = document.querySelector('#ipInput');
const allowedIpContainer = document.querySelector('#allowedIp');
const currentIpContainer = document.querySelector('#currentIp');
const msgContainer = document.querySelector('#main__msg');
const statusContainer = document.querySelector('#footer__status');
const footer = document.querySelector('#footer');

let currentIp = null;
let allowedIp = null;

// Get current client IP adress from cloudflare.
const getIp = async () => {
  const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
  response.text().then(function (text) {
    const data = text
      .split('\n')
      .filter((el) => el.startsWith('ip'))[0]
      .replace('ip=', '');
    currentIp = data;
    currentIpContainer.textContent = data;
    // Set current state
    setBlockState();
  });
};

// Get current client IP on Initial run.
getIp();

// Get allowed IP from storage if available.
chrome.storage.sync.get('ip', ({ ip }) => {
  allowedIpContainer.textContent = ip || '___________';
  allowedIp = ip || '___________';
  chrome.runtime.sendMessage({ newIp: ip }, function (response) {
    console.log(response.setMsg);
  });
});

// Handle new allowed ip input change.
ipBtn.addEventListener('click', function () {
  const inputVal = ipInput.value;
  if (validateIpFormat(inputVal)) {
    // set new allowed ip to storage.
    chrome.storage.sync.set({ ip: inputVal });
    allowedIpContainer.textContent = inputVal;
    allowedIp = inputVal;
    // send message to background
    chrome.runtime.sendMessage({ newIp: inputVal }, function (response) {
      console.log(response.setMsg);
    });
    showIpChangeSuccessMsg();
  } else {
    showInputErrorMsg();
  }
  ipInput.value = '';
  getIp();
});

// validate allowed ip input foramt.
const validateIpFormat = (ip) => {
  const rgx = /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/g;
  if (rgx.test(ip)) return true;
  else return false;
};

// handle invalid input format error messages.
const showInputErrorMsg = () => {
  const msg =
    '<span class="error-msg-icon">&#x25CF;</span><p class="error-msg-title">Please enter a valid IP address.</p>';
  msgContainer.innerHTML = msg;
  setTimeout(() => {
    msgContainer.innerHTML = '';
  }, 6000);
};

// handle successfull message for allowed ip change.
const showIpChangeSuccessMsg = () => {
  const msg =
    '<img src="/assets/check.svg" class="success-msg-icon"/><p class="success-msg-title">Allowed IP address changed successfully.</p>';
  msgContainer.innerHTML = msg;
  setTimeout(() => {
    msgContainer.innerHTML = '';
  }, 4000);
};

// handle extention access state to Binance.com
const setBlockState = () => {
  const blockedColor = '#FC5A5A';
  const blockedTitle =
    '<p class="blocked-status-title">Binance.com is Blocked !</p>';
  const blockedIcon =
    '<img src="/assets/x-white.svg" class="blocked-status-icon"/>';

  const openedColor = '#086CE6';
  const openedTitle =
    '<p class="opened-status-title">Binance.com is Open !</p>';
  const openedIcon =
    '<img src="/assets/check-white.svg" class="opened-status-icon"/>';

  if (currentIp === allowedIp) {
    footer.style.backgroundColor = openedColor;
    footer__status.innerHTML = openedIcon + openedTitle;
  } else {
    footer.style.backgroundColor = blockedColor;
    footer__status.innerHTML = blockedIcon + blockedTitle;
  }
};
