export function getEnabledStubs(state) {
  if (!state) return [];
  const stubs = state.stubs;
  return Object.keys(stubs)
    .filter((id) => !stubs[id].disabled)
    .map((id) => stubs[id]);
}
