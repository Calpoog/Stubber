export const REQUEST = 'REQUEST';
export const RESPONSE = 'RESPONSE';
export const CLEAR_LOG = 'CLEAR_LOG';

const initialState = { byID: [], byHash: {} };

export default function logs(state = initialState, action = {}) {
  switch (action.type) {
    case REQUEST: {
      return {
        byID: state.byID.concat(action.request.id),
        byHash: {
          ...state.byHash,
          [action.request.id]: action.request,
        },
      };
    }

    case RESPONSE: {
      const request = state.byHash[action.response.id];

      if (!request) return state;

      return {
        ...state,
        byHash: {
          ...state.byHash,
          [request.id]: {
            ...request,
            ...action.response,
          },
        },
      };
    }

    case CLEAR_LOG: {
      return initialState;
    }

    default:
      return state;
  }
}

export const addRequest = (request) => ({
  type: REQUEST,
  request,
});

export const addResponse = (response) => ({
  type: RESPONSE,
  response,
});

export const clearLog = () => ({
  type: CLEAR_LOG,
});

export const logActions = {
  addRequest,
  addResponse,
  clearLog,
};
