import reducer, { stubActions } from '../stubs.js';
import { folderActions } from '../folders.js';

describe('Stubs reducer', () => {
  const state = {};
  const fullState = {
    x: {
      disabled: true,
      headers: { key: 'value' },
      method: 'GET',
      name: 'Stub 1',
      response: 'json',
      status: '666',
      url: 'calvin is dope',
    },
    y: {
      headers: {},
      method: 'GET',
      name: 'Stub 2',
      response: '{"account":[]}',
      status: '200',
      url: 'url',
    },
    z: {
      headers: {},
      method: 'GET',
      name: 'Stub 3',
      response: '{"account":[]}',
      status: '200',
      url: 'url',
    },
  };

  test('initial state is empty', () => {
    expect(reducer()).toEqual(state);
  });

  test('can add a stub', () => {
    const newState = reducer(state, stubActions.addStub({ name: 'Stub 1' }));
    expect(Object.keys(newState)).toHaveLength(1);
    const newStub = Object.values(newState)[0];
    expect(newStub.name).toBe('Stub 1');
    expect(newState[newStub.id]).toEqual(newStub);
  });

  test('can remove a stub', () => {
    const newState = reducer(fullState, stubActions.removeStub({ id: 'x' }));
    expect(Object.keys(newState)).toHaveLength(2);
    expect(newState).not.toHaveProperty('x');
  });

  test('can edit a stub', () => {
    const edit = { id: 1, name: 'Test', status: 400 };
    const newState = reducer(fullState, stubActions.editStub(edit));
    expect(newState[1]).toMatchObject(edit);
  });

  test("can remove a folder's stubs", () => {
    const newState = reducer(fullState, folderActions.removeFolder({ stubs: ['x', 'y'] }));
    expect(Object.keys(newState)).toHaveLength(1);
    expect(newState).not.toHaveProperty('x');
    expect(newState).not.toHaveProperty('y');
  });

  test('can disable a stub', () => {
    const newState = reducer(fullState, stubActions.disableStub('y', true));
    expect(newState['y'].disabled).toBe(true);
  });

  test('can enable a stub', () => {
    const newState = reducer(fullState, stubActions.disableStub('x', false));
    expect(newState['x'].disabled).toBe(false);
  });
});
