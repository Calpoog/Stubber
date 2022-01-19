import proxyFetch from './fetch';
import proxyXMLHttpRequest from './xhr';

// This is filled by devtools
let stubs = [];

// Assume Stubber is turned off by default. Don't want to stub anything on accident
// before the content script updates the context with on/off status
let engaged = false;

export function getEngaged() {
  return engaged;
}

// Sends a message up to the content script
export function sendMessage(message) {
  window.postMessage({ source: 'stubber.context', ...message }, '*');
}

export function findStub(url, method) {
  return stubs.find(
    (stub) =>
      stub.method === method.toUpperCase() && (stub.url === url || (stub.regex && new RegExp(stub.url).test(url)))
  );
}

export function setup(window) {
  console.log('Injecting Stubber context script');

  proxyFetch(window);
  proxyXMLHttpRequest(window);

  // Listen for messages from the content script
  window.addEventListener('message', ({ data: message }) => {
    if (message.source !== 'stubber.content') return;

    switch (message.type) {
      case 'stubber-update-stubs':
        // the messages this accepts is an object matching the stubs format
        stubs = message.stubs;
        console.log('Received stubs', stubs);
        break;

      case 'stubber-status':
        const { status } = message;
        console.log(`Turning stubbing ${status ? 'on' : 'off'}`);
        engaged = status;
        break;
    }
  });

  // tell content script that the injection happened so it can send back the stubs
  sendMessage({ type: 'context-injected' });
}
