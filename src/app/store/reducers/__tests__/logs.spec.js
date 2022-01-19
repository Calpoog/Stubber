import reducer, { logActions } from '../logs.js';

describe('Stubs reducer', () => {
  const initialState = { byID: [], byHash: {} };

  test('initial state is empty', () => {
    expect(reducer()).toEqual(initialState);
  });

  let logs = { byID: [], byHash: {} };
  test('can add a request', () => {
    const request = {
      method: 'method',
      url: 'url',
      id: 0,
    };
    logs = reducer(initialState, logActions.addRequest(request));
    expect(logs.byID).toHaveLength(1);
    expect(logs.byID).toContain(0);
    expect(Object.keys(logs.byHash)).toHaveLength(1);
    expect(logs.byHash).toHaveProperty('0');
    expect(logs.byHash[0]).toMatchObject(request);
  });

  test('can add a response', () => {
    const response = {
      id: 0,
      body: 'body',
      headers: 'headers',
      status: 200,
      stubbed: true,
    };
    logs = reducer(logs, logActions.addResponse(response));
    expect(logs.byID).toHaveLength(1);
    expect(logs.byID).toContain(0);
    expect(Object.keys(logs.byHash)).toHaveLength(1);
    expect(logs.byHash).toHaveProperty('0');
    expect(logs.byHash[0]).toMatchObject(response);
    expect(logs.byHash[0].method).toBe('method');
  });

  test('can clear the log', () => {
    logs = reducer(logs, logActions.clearLog());
    expect(logs).toMatchObject(initialState);
  });
});
