import { render } from 'react-dom';
import App from './components/App';
import { Provider } from 'react-redux';
import { importAction, initialState, updateStatus } from '../app/store/reducer';
import importStubs from './utils/import';
import { logActions } from './store/reducers/logs';
import browser from 'webextension-polyfill';
import store from './store/store';

import './styles/styles.scss';
import { sendToBackground } from '../shared/connection';

// Get the DOM Element that will host our React application
const rootEl = document.getElementById('app');

render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootEl
);

// load state from local storage
async function sync() {
  const { state } = await browser.storage.local.get('state');
  console.log('Loaded state', state);
  if (state) {
    store.dispatch(importAction(importStubs(initialState, state), true));
  }
}

function messageHandler(message) {
  switch (message.name) {
    // the inspected page is making a request
    case 'request':
      store.dispatch(logActions.addRequest(message.request));
      break;
    // the inspected page got a response
    case 'response':
      store.dispatch(logActions.addResponse(message.response));
      break;
    // other Stubber windows could be open so keep them in sync
    case 'stubs':
      sync();
      break;
    case 'status':
      store.dispatch(updateStatus(message.status));
      break;
  }
}

const isDevtools = !!browser.devtools;
sendToBackground({
  name: 'init-' + (isDevtools ? 'devtools' : 'popup'),
  tabId: browser.devtools?.inspectedWindow.tabId,
});

sync();
