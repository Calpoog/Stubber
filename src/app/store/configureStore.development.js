import { createStore, applyMiddleware, compose } from 'redux';
//import { persistState } from 'redux-devtools';
import promiseMiddleware from 'redux-promise';
import { createLogger } from 'redux-logger';
import syncMiddleware from './sync-middleware';
import rootReducer from './reducer';

/**
 * Entirely optional.
 * This tiny library adds some functionality to your DevTools,
 * by logging actions/state to your console. Used in conjunction
 * with your standard DevTools monitor gives you great flexibility.
 */
const logger = createLogger();

const middlewares = [promiseMiddleware, logger, syncMiddleware, require('redux-immutable-state-invariant').default()];

// By default we try to read the key from ?debug_session=<key> in the address bar
// const getDebugSessionKey = function () {
//     const matches = window.location.href.match(/[?&]debug_session=([^&]+)\b/);
//     return (matches && matches.length) ? matches[1] : null;
// };

const enhancer = compose(applyMiddleware(...middlewares));

export default function configureStore(initialState) {
  return createStore(rootReducer, initialState, enhancer);
}
