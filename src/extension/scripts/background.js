import browser from 'webextension-polyfill';

console.log('starting background script');

async function getEngaged() {
  const { engaged = false } = await browser.storage.local.get('engaged');
  return engaged;
}

(async () => {
  // set the appropriate browser action icon
  updateBrowserAction(await getEngaged());
})();

// Open and remember Stubber as a popup window
browser.browserAction.onClicked.addListener(async () => {
  const { popupId } = await browser.storage.local.get('popupId');
  if (popupId) {
    try {
      return await browser.windows.update(popupId, { focused: true });
    } catch (e) {}
  }

  const popup = await browser.windows.create({
    type: 'panel',
    url: 'app/index.html',
  });
  browser.storage.local.set({ popupId: popup.id });
});

function updateBrowserAction(engaged) {
  const ending = engaged ? '' : '-off';
  browser.browserAction.setTitle({ title: 'Stubber ' + (engaged ? 'ON' : 'OFF') });
  const base = `/extension/images/stubber${ending}`;
  browser.browserAction.setIcon({
    path: {
      16: `${base}-16.png`,
      48: `${base}-48.png`,
      128: `${base}-128.png`,
      256: `${base}-256.png`,
    },
  });
}

const panels = {};
let popup;

browser.runtime.onConnect.addListener((port) => {
  // All messages received here come from devtools or popup page
  const listener = function (message, sender) {
    console.log('devtools/popup message', message, sender);
    switch (message.name) {
      case 'init-devtools':
        panels[message.tabId] = port;
        break;
      case 'init-popup':
        popup = port;
        break;
      case 'status':
        updateBrowserAction(message.status);
      // don't break, this message still needs sent to other devtools/popup
      default:
        // send to all *other* devtools
        Object.values(panels).forEach((panel) => {
          console.log('panels', panel.name, sender.name);
          if (panel.name !== sender.name) {
            panel.postMessage(message);
          }
        });

        // send to popup
        if (port !== popup) {
          popup.postMessage(message);
        }

        // send to all tabs
        browser.tabs
          .query({})
          .then((tabs) => {
            if (!tabs) return;
            // send out updated stubs to all tabs
            return Promise.all(tabs.map(({ id }) => browser.tabs.sendMessage(id, message)));
          })
          .catch((e) => {
            console.log('Failed to send message', e);
            // failed to sendMessage to a tab (likely a HMD or extension update problem)
          });
    }
  };

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(listener);

  port.onDisconnect.addListener((port) => {
    port.onMessage.removeListener(listener);

    if (port === popup) {
      popup = undefined;
    } else {
      const tabs = Object.keys(panels);
      for (let i = 0, len = tabs.length; i < len; i++) {
        if (panels[tabs[i]] == port) {
          delete panels[tabs[i]];
          break;
        }
      }
    }
  });
});

// Only content scripts will use runtime.onMessage to communicate with the bg script
browser.runtime.onMessage.addListener((message, sender) => {
  // Content script messages go to their devtools and all popups
  if (message.source === 'stubber.content') {
    console.log('Content script message', Date.now(), message, sender);

    // Find an associated devtool if any
    const tabId = sender.tab.id;
    if (tabId in panels) {
      panels[tabId].postMessage(message);
    } else {
      console.log('Tab not found in connection list.', message, sender);
    }
  }

  // Send to popup
  popup?.postMessage(message);
});
