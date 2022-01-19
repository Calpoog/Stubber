import browser from 'webextension-polyfill';
import { v4 as uuidv4 } from 'uuid';

const uuid = uuidv4();
const backgroundPageConnection = browser.runtime.connect({
  name: uuid,
});

backgroundPageConnection.onMessage.addListener((message, port) => {
  if (!message) return;

  console.log('port.onMessage', message);

  messageHandler(message);
});

export function sendToBackground(message) {
  backgroundPageConnection.postMessage(message);
}
