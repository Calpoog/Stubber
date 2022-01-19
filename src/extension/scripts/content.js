import browser from 'webextension-polyfill';
import { getEnabledStubs } from '../../shared/utils';

// listen for messages from background.js and relay them to the context script
browser.runtime.onMessage.addListener((message) => {
  switch (message.name) {
    case 'stubs':
      sendStubs(message.stubs);
      break;
    case 'status':
      sendStatus(message.status);
      break;
  }
});

function sendStubs(stubs) {
  console.log('sending stubs');
  window.postMessage({ type: 'stubber-update-stubs', source: 'stubber.content', stubs });
}

function sendStatus(status) {
  window.postMessage({ type: 'stubber-status', source: 'stubber.content', status });
}

// listen to messages from the context script and respond appropriately
window.addEventListener('message', async ({ data: message }) => {
  if (message.source !== 'stubber.context') return;

  // message is sent when injection code has executed, and we can send it the stubs list
  if (message.type === 'context-injected') {
    const { state, engaged } = await browser.storage.local.get(['state', 'engaged']);
    sendStubs(getEnabledStubs(state));
    sendStatus(engaged);
  }

  // pass the message on to the background script
  browser.runtime.sendMessage({ ...message, source: 'stubber.content' });
});

// inject the context script
const script = document.createElement('script');
script.src = browser.runtime.getURL('extension/scripts/context/context.js');
(document.head || document.documentElement).appendChild(script);
script.onload = () => script.remove();
