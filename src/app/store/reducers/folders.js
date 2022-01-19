import { ADD_STUB, REMOVE_STUB } from './stubs';
import { v4 as uuidv4 } from 'uuid';

export const ADD_FOLDER = 'ADD_FOLDER';
export const REMOVE_FOLDER = 'REMOVE_FOLDER';
export const EDIT_FOLDER = 'EDIT_FOLDER';
export const TOGGLE_FOLDER = 'TOGGLE_FOLDER';
export const MOVE_STUB = 'MOVE_STUB';
export const MOVE_FOLDER = 'MOVE_FOLDER';

export default function folders(state = { byID: [], byHash: {}, editing: null }, action = {}) {
  switch (action.type) {
    case ADD_FOLDER: {
      // also can add an array of f because it uses concat
      let byID = state.byID.slice(0);
      let byHash = { ...state.byHash };

      const folder = Object.assign({}, action.folder, {
        id: uuidv4(), // give new folder an ID
        stubs: [],
        open: true,
      });

      // add to the ordered ID list
      byID.unshift(folder.id);
      // add it to the hash map
      byHash[folder.id] = folder;

      return { byID, byHash, editing: folder.id };
    }

    case REMOVE_FOLDER: {
      const byHash = { ...state.byHash };
      delete byHash[action.folder.id];

      return {
        byID: state.byID.filter((id) => action.folder.id !== id),
        byHash,
      };
    }

    case EDIT_FOLDER: {
      const byHash = {
        ...state.byHash,
        [action.id]: {
          ...state.byHash[action.id],
          name: action.name,
        },
      };

      return { ...state, byHash, editing: null };
    }

    case TOGGLE_FOLDER: {
      const folder = state.byHash[action.id];
      const byHash = {
        ...state.byHash,
        [action.id]: {
          ...folder,
          open: !folder.open,
        },
      };

      return { ...state, byHash };
    }

    // handle ADD_STUB as well to put it in the right folder
    case ADD_STUB: {
      const folder = state.byHash[action.stub.folderID];
      const byHash = {
        ...state.byHash,
        [action.stub.folderID]: {
          ...folder,
          stubs: folder.stubs.concat(action.stub.id),
        },
      };

      return { ...state, byHash };
    }

    case MOVE_FOLDER: {
      const currentPosition = state.byID.indexOf(action.id);
      const position = action.position;

      if (currentPosition === position || currentPosition + 1 === position) {
        return state;
      } else {
        const byID = state.byID.slice(0);
        byID.splice(currentPosition, 1);
        byID.splice(position > currentPosition ? position - 1 : position, 0, action.id);
        return {
          ...state,
          byID,
        };
      }
    }

    case MOVE_STUB: {
      const byHash = { ...state.byHash };
      const oldFolder = byHash[action.oldFolderID];
      const newFolder = byHash[action.newFolderID];
      const stubID = action.stubID;
      let stubs = newFolder.stubs.slice(0);

      // if it changed folders, we remove it from the old one
      if (oldFolder.id !== newFolder.id) {
        byHash[oldFolder.id] = {
          ...oldFolder,
          stubs: oldFolder.stubs.filter((stubID) => stubID !== action.stubID),
        };
        // add it to the new one
        if (action.position === undefined) {
          stubs.push(stubID);
        } else {
          stubs.splice(action.position, 0, stubID);
        }
      } else {
        // otherwise we're moving it in its current folder
        const currentPosition = stubs.indexOf(stubID);
        // it moved if the position is not the original, or original + 1
        // because coming after itself is still its original position
        if (action.position !== currentPosition && action.position !== currentPosition + 1) {
          // if the new position is greater than current, subtract one to account for the moving of itself
          const newPos = action.position < currentPosition ? action.position : action.position - 1;
          stubs = stubs.filter((stubID) => stubID !== action.stubID);
          stubs.splice(newPos, 0, stubID);
        } else {
          // if it didn't move and the folder is the same, then nothing changed
          return state;
        }
      }

      // update the new/current folder
      byHash[newFolder.id] = {
        ...newFolder,
        stubs,
      };

      return { ...state, byHash };
    }

    case REMOVE_STUB: {
      const byHash = { ...state.byHash };
      const stub = action.stub;

      for (let i = 0; i < state.byID.length; i++) {
        const id = state.byID[i];
        const folder = byHash[id];

        if (folder.stubs.indexOf(stub.id) >= 0) {
          byHash[id] = {
            ...folder,
            stubs: folder.stubs.filter((id) => id !== stub.id),
          };
          break;
        }
      }

      return { ...state, byHash };
    }

    default:
      return state;
  }
}

export const addFolder = (folder) => ({
  type: ADD_FOLDER,
  folder,
});

export const removeFolder = (folder) => ({
  type: REMOVE_FOLDER,
  folder,
});

export const editFolder = (id, name) => ({
  type: EDIT_FOLDER,
  id,
  name,
});

export const toggleFolderOpen = (id) => ({
  type: TOGGLE_FOLDER,
  id,
});

export const moveStub = (oldFolderID, newFolderID, stubID, position) => ({
  type: MOVE_STUB,
  oldFolderID,
  newFolderID,
  stubID,
  position,
});

export const moveFolder = (id, position) => ({
  type: MOVE_FOLDER,
  id,
  position,
});

export const folderActions = {
  addFolder,
  removeFolder,
  editFolder,
  toggleFolderOpen,
  moveStub,
  moveFolder,
};

// gets ordered list of folders
const orderedFolders = (state) => state.folders.byID.map((id) => state.folders.byHash[id]);

// only recomputes when the order changes, but can't use reselect since the output function needs more state than input functions provide
export const getOrderedFolders = (function () {
  let cachedInput = undefined;
  let cachedOutput = undefined;
  return (state) => {
    let order = state.folders.byID;
    if (order !== cachedInput) {
      cachedInput = order;
      cachedOutput = orderedFolders(state);
    }

    return cachedOutput;
  };
})();
