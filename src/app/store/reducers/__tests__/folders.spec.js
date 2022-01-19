import reducer, { folderActions } from '../folders.js';
import { addStub, removeStub } from '../stubs.js';

describe('Folders reducer', () => {
  const state = { byID: [], byHash: {}, editing: null };
  const fullState = {
    byID: ['a', 'b', 'c'],
    byHash: {
      a: {
        name: 'Folder 1',
        id: 'a',
        open: false,
        stubs: ['3', '4'],
      },
      b: {
        name: 'Folder 2',
        id: 'b',
        open: false,
        stubs: [],
      },
      c: {
        name: 'Folder 3',
        id: 'c',
        open: false,
        stubs: ['0', '1', '2'],
      },
    },
    editing: null,
  };

  test('initial state is empty', () => {
    expect(reducer()).toEqual(state);
  });

  test('can add a folder', () => {
    const newState = reducer(state, folderActions.addFolder({ name: 'Folder 1' }));
    expect(newState.byID).toHaveLength(1);
    expect(Object.keys(newState.byHash)).toHaveLength(1);
    const id = newState.byID[0];
    expect(newState.byHash[id].name).toBe('Folder 1');
    expect(newState.byHash[id].id).toBe(id);
  });

  test('can remove a folder', () => {
    const newState = reducer(fullState, folderActions.removeFolder({ id: 'b' }));
    expect(newState.byID).toHaveLength(2);
    expect(Object.keys(newState.byHash)).toHaveLength(2);
    expect(newState.byHash['b']).toBeUndefined;
    expect(newState.byID).not.toContain('b');
  });

  test('can edit a folder', () => {
    const newState = reducer(fullState, folderActions.editFolder('a', 'New Name'));
    expect(newState.byHash['a'].name).toBe('New Name');
    expect(newState.editing).toBeNull;
    expect(newState.byID).toEqual(fullState.byID);
  });

  test('can toggle a folder', () => {
    let newState = reducer(fullState, folderActions.toggleFolderOpen('a'));
    expect(newState.byHash['a'].open).toBe(true);
    newState = reducer(newState, folderActions.toggleFolderOpen('a'));
    expect(newState.byHash['a'].open).toBe(false);
  });

  test('can add a stub', () => {
    const newState = reducer(fullState, addStub({ name: 'New Stub', id: 'x', folderID: 'a' }));
    expect(newState.byHash['a'].stubs).toHaveLength(3);
    expect(newState.byHash['a'].stubs[2]).toBe('x');
  });

  test('can remove a stub', () => {
    const newState = reducer(fullState, removeStub({ id: '1', folderID: 'c' }));
    expect(newState.byHash['c'].stubs).toHaveLength(2);
    expect(newState.byHash['c'].stubs).not.toContain('1');
  });

  test('can move a stub within folder', () => {
    const newState = reducer(fullState, folderActions.moveStub('c', 'c', '0', 2));
    expect(newState.byHash['c'].stubs).toHaveLength(3);
    expect(newState.byHash['c'].stubs[1]).toBe('0');
  });

  test('does nothing when moving stub to same place', () => {
    let newState = reducer(fullState, folderActions.moveStub('c', 'c', '0', 1));
    expect(newState.byHash['c'].stubs.length).toBe(3);
    expect(newState.byHash['c'].stubs[0]).toBe('0');

    newState = reducer(fullState, folderActions.moveStub('c', 'c', '0', 0));
    expect(newState.byHash['c'].stubs.length).toBe(3);
    expect(newState.byHash['c'].stubs[0]).toBe('0');
  });

  test('can move a stub between folders', () => {
    const newState = reducer(fullState, folderActions.moveStub('a', 'c', '3', 1));
    expect(newState.byHash['c'].stubs).toHaveLength(4);
    expect(newState.byHash['a'].stubs).toHaveLength(1);
    expect(newState.byHash['c'].stubs).toContain('3');
    expect(newState.byHash['a'].stubs).not.toContain('3');
    expect(newState.byHash['c'].stubs[1]).toBe('3');
  });

  test('can move a folder', () => {
    const newState = reducer(fullState, folderActions.moveFolder('a', 3));
    expect(newState.byID).toHaveLength(3);
    expect(newState.byID[0]).toBe('b');
    expect(newState.byID[2]).toBe('a');
  });
});
