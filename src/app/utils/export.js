export default function exportState(state) {
  // reduce the state to remove logs
  const { folders, stubs, engaged } = state;

  return {
    folders,
    stubs,
    engaged,
  };
}
