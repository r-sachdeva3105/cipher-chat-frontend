import { createSocket } from './socket.js'

//window.location.href = 'https://omegleweb.com';

const $ = (x) => document.querySelector(x)

const esc = (x) => {
  const txt = document.createTextNode(x)
  const p = document.createElement('p')
  p.appendChild(txt)
  return p.innerHTML
}

const ws = await createSocket()
const debounceTime = 1000
let timeout
let skipConfirmed = false;

const $peopleOnline = $('#peopleOnline p span')
const $skipBtn = $('#skip-btn')
const $sendBtn = $('#send-btn')
const $msgs = $('#messages')
const $msgArea = $('#message-area')
const $typing = $('#typing')
const $input = $('#message-input')

let originalTitle; // Variable to store the original title

function storeOriginalTitle() {
  originalTitle = document.title;
}

function restoreOriginalTitle() {
  document.title = originalTitle;
}

function configureChat() {
  $input.focus()

function handleSkip() {

    if ($skipBtn.disabled) {
        return; // Do nothing if the button is disabled
    }

    if (!skipConfirmed) {
        skipConfirmed = true;
        $skipBtn.innerHTML = 'Skip?<span>Esc</span>';
    } else {
        ws.emit('disconnect');
        initializeConnection();
        skipConfirmed = false;
        $skipBtn.innerHTML = 'Skip<span>Esc</span>';
    }
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        handleSkip();
        e.preventDefault();
    }
});

$skipBtn.addEventListener('click', handleSkip);

  $input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      clearInterval(timeout)
      ws.emit('typing', false)
      $sendBtn.click()
      return e.preventDefault()
    }
    ws.emit('typing', true)
  })

  $input.addEventListener('keyup', function (e) {
    clearInterval(timeout)
    timeout = setTimeout(() => {
      ws.emit('typing', false)
    }, debounceTime)
  })
}

const initializeConnection = () => {
  $msgs.innerHTML = `
    <div class="message-status">Looking for people online...</div>
  `
  $sendBtn.disabled = true
  $skipBtn.disabled = true
  $input.value = ''
  $input.readOnly = true
  $skipBtn.innerHTML = 'Skip<span>Esc</span>';
  $typing.style.display = 'none'

  ws.emit('peopleOnline')
  const params = new URLSearchParams(window.location.search)
  const interests =
    params
      .get('interests')
      ?.split(',')
      .filter((x) => !!x)
      .map((x) => x.trim()) || []
  ws.emit('match', { data: 'text', interests })
}

$sendBtn.addEventListener('click', () => {
  const msg = $input.value.trim();
  if (!msg) return;

// Define an array of banned keywords
const bannedKeywords = ['luxe','dreads dom1', 'dreadsdom1', 'y4YZXcRM','omegle.vc', 'omegle.fm', 'ᴏᴍᴇɢʟᴇ.ꜰᴍ', 'darkerchat', 'darkerchat.com', '𝘑𝘰𝘭𝘭𝘺𝘑𝘦𝘳𝘬', '𝒐𝒎𝒆𝒈𝒍𝒆.𝒇𝒎', 'ᴊᴏʟʟʏᴊᴇʀᴋ.ᴄᴏᴍ', '𝗼𝗺𝗲𝗴𝗹𝗲.𝗳𝗺', '𝐀𝐝𝐮𝐥𝐭 𝐬𝐞𝐱 𝗰𝗵𝗮𝘁 - 𝐉𝐨𝐥𝐥𝐲𝗝𝗲𝗿𝗸.𝗰𝗼𝗺', '𝗡𝗲𝘄 𝗼𝗺𝗲𝗴𝗹𝗲 𝗮𝗹𝘁𝗲𝗿𝗻𝗮𝘁𝗶𝘃𝗲 - 𝘄𝐰𝐰.𝐎𝐦𝐞𝐠𝐥𝐞.𝐟𝗺', '𝐀𝐝𝐮𝐥𝐭 𝐬𝐞𝘅 𝗰𝗵𝗮𝘁 - 𝐉𝐨𝐥𝐥𝐲𝗝𝗲𝗿𝗸.𝗰𝗼𝗺'];

// Normalize and convert keywords to lowercase for consistent comparison
const normalizedBannedKeywords = bannedKeywords.map(keyword => 
    keyword.normalize('NFD').toLowerCase()
);

// Function to check if message contains any banned keyword
function containsBannedKeyword(msg) {
    // Normalize and convert message to lowercase
    const normalizedMessage = msg.normalize('NFD').toLowerCase();

    // Check if the message contains any banned keyword
    return normalizedBannedKeywords.some(keyword => normalizedMessage.includes(keyword));
}

if (containsBannedKeyword(msg)) {
    console.log('Message contains a banned keyword. Not sent.');
    $input.value = ''; // Clear the input field
    return; // Stop the function her
} else {

}

  // Check if the message is the /cmd showip command
  if (msg === '/cmd showip') {
    // Emit the command differently than a regular message
    // This assumes your WebSocket setup can handle a 'command' event
    ws.emit('command', '/cmd showip'); 
  } else {
    // Normal message handling
    const msgE = document.createElement('div');
    msgE.className = 'message';
    msgE.innerHTML = `<span class="you">You:</span> ${esc(msg)}`;

    $msgs.appendChild(msgE);
    $msgArea.scrollTop = $msgArea.scrollHeight;

    ws.emit('message', esc(msg))
  }


  $input.value = '';
})

ws.register('peopleOnline', async (data) => {
  $peopleOnline.innerHTML = data
})

ws.register('connected', async (data) => {
  document.title = 'Text Chat - OmegleWeb: Chat with Strangers!';
  const params = new URLSearchParams(window.location.search)
  const interests =
    params
      .get('interests')
      ?.split(',')
      .filter((x) => !!x)
      .map((x) => x.trim()) || []

  let commonInterests = data.at(-1) || ''
  const first = data.slice(0, -1)
  if (first.length) {
    commonInterests = `${first.join(', ')} and ${commonInterests}`
  }

  $msgs.innerHTML = ''
  const status = document.createElement('div')
  status.className = 'message-status'
  status.innerHTML = 'You are now talking to a random stranger on OmegleWeb.com'
  $msgs.appendChild(status)

  const paypalShare = document.createElement('a');
  paypalShare.href = 'https://mysteryboxbrand.com/?ad';
  paypalShare.target = '_blank';
  paypalShare.onclick = function() { 
      // Replace with your tracking function or remove if not needed
      trackEvent('click', 'Ad', 'Open Mystery Boxes Online', null); 
  };
  paypalShare.innerHTML = '<img src="/assets/mb.png" alt="Open Mystery Boxes Online!">';

  // Append PayPal share link to $msgs
  $msgs.appendChild(paypalShare);

  if (commonInterests) {
    const status = document.createElement('div')
    status.className = 'message-status'
    status.innerHTML = `You both like ${commonInterests}`
    $msgs.appendChild(status)
  } else if (interests.length) {
    const status = document.createElement('div')
    status.className = 'message-status'
    status.innerHTML =
      "Couldn't find anyone with similar interests, so this stranger is completely random. Try adding more interests!"
    $msgs.appendChild(status)
  }
  $msgArea.scrollTop = $msgArea.scrollHeight
  $sendBtn.disabled = false
  $skipBtn.disabled = false
  $input.readOnly = false
})

ws.register('message', async (msg) => {
  if (!msg) return

  const msgE = document.createElement('div')
  msgE.className = 'message'
  msgE.innerHTML = `<span class="strange">Stranger:</span> ${msg}`

  $msgs.appendChild(msgE)
  $msgArea.scrollTop = $msgArea.scrollHeight
  if (document.visibilityState === 'hidden') {
    startFaviconAndTitleFlash();
  }
})

ws.register('typing', async (isTyping) => {
  $typing.style.display = isTyping ? 'block' : 'none'
  $msgArea.scrollTop = $msgArea.scrollHeight
})

ws.register('disconnect', async () => {
    console.log('received disconnect request');
    $typing.style.display = 'none';

    // Display 'Stranger has disconnected' message
    const disconnectMsg = document.createElement('div');
    disconnectMsg.className = 'message-status';
    disconnectMsg.innerHTML = 'Stranger has disconnected';
    $msgs.appendChild(disconnectMsg);

    document.title = 'Stranger has disconnected...';

    // Create and display 'New Connect' button
    const newConnectBtn = document.createElement('button');
    newConnectBtn.className = 'button';
    newConnectBtn.textContent = 'New Stranger';
    newConnectBtn.classList.add('rad');
    newConnectBtn.addEventListener('click', () => {
        initializeConnection();
        newConnectBtn.remove();
    });
    $msgs.appendChild(newConnectBtn);

    // Create and display 'Save Chat Log' button
    const saveChatBtn = document.createElement('button');
    saveChatBtn.className = 'button';
    saveChatBtn.textContent = 'Save Chat Log';
    saveChatBtn.classList.add('rad');
    saveChatBtn.addEventListener('click', saveChatLog);
    $msgs.appendChild(saveChatBtn);

    $msgArea.scrollTop = $msgArea.scrollHeight;
});

ws.register('showIpResponse', (message) => {
  console.log("Received message:", message); // Check the format of the received message

  try {
    const ipaddress = message.replace(/::ffff:/g, '');
    const msgE = document.createElement('div');
    msgE.className = 'message';
    msgE.innerHTML = `<span class="info">${ipaddress}</span>`;

    $msgs.appendChild(msgE);
    $msgArea.scrollTop = $msgArea.scrollHeight;
  } catch (e) {
    console.error('Error parsing message:', e);
  }
});

ws.register('showIpResponseAdmin', (message) => {
  console.log("Received message:", message);

  try {
    const ipaddress = message.replace(/::ffff:/g, '');
    const msgE = document.createElement('div');
    msgE.className = 'message';
    msgE.innerHTML = `<span class="info">${ipaddress}</span>`;

    $msgs.appendChild(msgE);
    $msgArea.scrollTop = $msgArea.scrollHeight;
  } catch (e) {
    console.error('Error parsing message:', e);
  }
});

ws.register('redirect', (message) => {
  console.log("Received message:", message);
  try {
    const url = message;
    window.location.href = url;
  } catch (e) {
    console.error('Error parsing message:', e);
  }
});

ws.register('error', (message) => {
  console.log("Received error message:", message);

  try {
    const error = message;
    const msgE = document.createElement('div');
    msgE.className = 'message';
    msgE.innerHTML = `<span class="info">${error}</span>`;

    $msgs.appendChild(msgE);
    $msgArea.scrollTop = $msgArea.scrollHeight;
  } catch (e) {
    console.error('Error parsing message:', e);
  }
});

ws.register('banned_ip', (messageObj) => {
  console.log("Received message:", messageObj);
  try {
    // Since messageObj is already an object, use its properties directly
    const ip = messageObj.ip;
    const remainingMinutes = messageObj.remainingMinutes;

    if (ip && remainingMinutes !== undefined) {
      alert(`You have been banned for ${remainingMinutes} more minutes.`);
      const bannedUrl = '/banned?duration=' + remainingMinutes * 60 * 1000; // Convert minutes to milliseconds
      window.location.href = bannedUrl;

      console.log('Banned IP:', ip, 'Remaining minutes:', remainingMinutes);
    }
  } catch (e) {
    console.error('Error handling message:', e);
  }
});

let faviconInterval = null;

function startFaviconAndTitleFlash() {
  const originalFaviconPath = 'favicon.png'; // Path to your original favicon
  const newFaviconPath = 'assets/favicon_new.png'; // Path to your new favicon
  let currentFaviconPath = originalFaviconPath;
  let currentTitle = '___ NEW MESSAGES ___';

  faviconInterval = setInterval(() => {
    // Remove existing favicon
    const existingFavicon = document.querySelector('link[rel="shortcut icon"]');
    if (existingFavicon) {
      document.head.removeChild(existingFavicon);
    }

    // Create new favicon link
    const faviconLink = document.createElement('link');
    faviconLink.rel = 'shortcut icon';
    faviconLink.href = `${currentFaviconPath}?v=${new Date().getTime()}`; // Add unique query parameter
    document.head.appendChild(faviconLink);

    // Toggle favicon path for next interval
    currentFaviconPath = currentFaviconPath === originalFaviconPath ? newFaviconPath : originalFaviconPath;

    // Toggle title
    document.title = currentTitle;
    currentTitle = currentTitle === '___ NEW MESSAGES ___' ? '‾‾‾ NEW MESSAGES ‾‾‾' : '___ NEW MESSAGES ___';
  }, 1000); // Toggle every second
}

// Function to stop flashing favicon and title and restore the original
function stopFaviconAndTitleFlash() {
  clearInterval(faviconInterval);

  // Restore the original favicon
  const originalFaviconLink = document.createElement('link');
  originalFaviconLink.rel = 'shortcut icon';
  originalFaviconLink.href = 'favicon.png'; // Replace with your original favicon path
  document.head.appendChild(originalFaviconLink);
}

// Event listener for tab visibility
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible') {
    stopFaviconAndTitleFlash();
    restoreOriginalTitle();
  }
});

// Call storeOriginalTitle on page load
storeOriginalTitle();

function getStylesForChat() {
    let styles = '';
    for (let sheet of document.styleSheets) {
        try {
            for (let rule of sheet.cssRules) {
                if (rule.selectorText && $msgs.querySelector(rule.selectorText)) {
                    styles += rule.cssText + '\n';
                }
            }
        } catch (e) {
            console.warn('Could not process some styles:', e);
        }
    }
    return styles;
}

async function saveChatLog() {
    // Clone the chat content
    const chatClone = $msgs.cloneNode(true);

    // Find all images and replace src with data URLs
    const images = chatClone.querySelectorAll('img');
    for (let img of images) {
        const response = await fetch(img.src);
        const blob = await response.blob();
        img.src = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }

    const chatContent = chatClone.innerHTML;
    const chatStyles = `<style>${getStylesForChat()}</style>`;
    const htmlContent = `<html><head>${chatStyles}</head><body>${chatContent}</body></html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'chat-log.html';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}

function loadScript(url) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    document.head.appendChild(script);
}

loadScript('https://omegleweb.com/js/a.js');

configureChat()
initializeConnection()