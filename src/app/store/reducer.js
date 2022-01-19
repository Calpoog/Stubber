import stubsReducer from './reducers/stubs';
import foldersReducer from './reducers/folders';
import logsReducer from './reducers/logs';

export const initialState = {
  stubs: {},
  folders: {
    byID: [],
    byHash: {},
  },
  logs: {
    byID: [],
    byHash: {},
  },
};

export const IMPORT = 'IMPORT';
export const CLEAR_ALL = 'CLEAR_ALL';
export const STATUS = 'STATUS';

export default function root(state = initialState, action = {}) {
  switch (action.type) {
    case CLEAR_ALL:
      return initialState;

    case IMPORT:
      return { ...initialState, ...action.state }; // just replace the whole state

    case STATUS:
      return { ...state, engaged: action.status };
  }

  // otherwise the state we get from the sub-reducers
  return {
    stubs: stubsReducer(state.stubs, action),
    folders: foldersReducer(state.folders, action),
    logs: logsReducer(state.logs, action),
    engaged: state.engaged,
  };
}

export const importAction = (state, sync) => ({ type: IMPORT, state, sync });
export const clearState = () => ({ type: CLEAR_ALL });
export const updateStatus = (status) => ({ type: STATUS, status });
