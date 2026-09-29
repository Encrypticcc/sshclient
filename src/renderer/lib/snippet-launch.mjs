/**
 * Where a saved snippet should run.
 *
 * Host ids that no longer match a saved host are reported and left out of
 * `hosts`. A snippet that names nothing is `untargeted`: the caller sends it
 * to an SSH session that is already open. `runLocal` with no cwd uses the
 * login shell's home directory.
 */
export function planSnippetLaunch(snippet, hosts) {
  const hostList = Array.isArray(hosts) ? hosts : [];
  const targetIds = Array.isArray(snippet?.targets)
    ? snippet.targets.filter((id) => typeof id === 'string')
    : [];

  const resolvedHosts = [];
  const missingHostIds = [];
  for (const id of targetIds) {
    const host = hostList.find((candidate) => candidate && candidate.id === id);
    if (host) resolvedHosts.push(host);
    else missingHostIds.push(id);
  }

  const runLocal = snippet?.runLocal === true;
  const cwd = typeof snippet?.cwd === 'string' ? snippet.cwd.trim() : '';
  const local = runLocal ? (cwd ? { cwd } : {}) : null;

  return {
    local,
    hosts: resolvedHosts,
    missingHostIds,
    untargeted: !runLocal && targetIds.length === 0,
  };
}
