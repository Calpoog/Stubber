export default function importStubs(state, json) {
  const { folders, stubs } = state;
  const importedState = typeof json === 'string' ? JSON.parse(json) : json;

  const newState = {
    stubs: { ...stubs },
    folders: {
      byID: folders.byID.slice(0),
      byHash: { ...folders.byHash },
    },
  };

  importedState.folders.byID.forEach((importedFolderId) => {
    const existingFolder = folders.byHash[importedFolderId];
    const importedFolder = importedState.folders.byHash[importedFolderId];

    // New folder or not, it could contain stubs we already have in a different folder, so we
    // need to remove them from existing folder
    importedFolder.stubs.forEach((importedStubId) => {
      const existingStub = stubs[importedStubId];
      if (existingStub) {
        const existingFolderStubs = folders.byHash[existingStub.folderID].stubs;
        existingFolderStubs.splice(existingFolderStubs.indexOf(existingStub.id), 1);
      }
    });

    // Mix in imported stubs, those with the same ID get imported definitions
    Object.assign(newState.stubs, importedState.stubs);

    if (!existingFolder) {
      newState.folders.byID.push(importedFolder.id);
      newState.folders.byHash[importedFolder.id] = importedFolder;
    } else {
      const mergedFolderStubs = Array.from(new Set(importedFolder.stubs.concat(existingFolder.stubs)));
      newState.folders.byHash[importedFolder.id] = { ...existingFolder, ...importedFolder, stubs: mergedFolderStubs };
    }
  });

  console.log('imported state', newState);

  return newState;
}
