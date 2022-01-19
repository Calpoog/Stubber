import { createStore, applyMiddleware, compose } from 'redux';
import promiseMiddleware from 'redux-promise';
import rootReducer from './reducer';
import syncMiddleware from './sync-middleware';

const enhancer = compose(applyMiddleware(promiseMiddleware, syncMiddleware));

export default function configureStore(initialState) {
  return createStore(rootReducer, initialState, enhancer);
}
