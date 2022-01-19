import browser from 'webextension-polyfill';
import exportState from '../utils/export';
import { getEnabledStubs } from '../../shared/utils';
import { sendToBackground } from '../../shared/connection';

// Watches the store for enabled stubs to send to content scripts
const sendStubs = (state) => {
  const enabledStubs = getEnabledStubs(state);

  console.log('sending stubs');

  // send just the stubs to the context script
  sendToBackground({
    name: 'stubs',
    stubs: enabledStubs,
  });
};

// Watches the store to save state to local storage
const saveState = (state) => {
  // save app state to localStorage
  const exported = exportState(state);
  console.log('Saved state: ', exported);
  browser.storage.local.set({
    state: exported, // for the panel to recall next time
  });
};

const syncMiddleware = (store) => (next) => (action) => {
  const prevState = store.getState();
  const result = next(action);
  const state = store.getState();
  if (!action.sync) {
    const hasNewStubs = prevState.stubs !== state.stubs;
    // forget memoization because these aren't called on every action
    // Example: sync (import) then log request causes saved state and resending stubs
    // even when only logs changed (because these don't run on sync so first run happens on first request)
    if (hasNewStubs) {
      sendStubs(state);
    }
    if (hasNewStubs || prevState.folders !== state.folders) {
      saveState(state);
    }
  }
  return result;
};

export default syncMiddleware;
