const assert = require('node:assert/strict');
const test = require('node:test');

test('plans where a snippet runs', async () => {
  const { planSnippetLaunch } = await import('../src/renderer/lib/snippet-launch.mjs');
  const alpha = { id: 'alpha', label: 'Alpha' };
  const beta = { id: 'beta', label: 'Beta' };
  const hosts = [alpha, beta];

  const localOnly = planSnippetLaunch({ command: 'pwd', runLocal: true }, hosts);
  assert.deepEqual(localOnly, {
    local: {},
    hosts: [],
    missingHostIds: [],
    untargeted: false,
  });

  const localDir = planSnippetLaunch(
    { command: 'pwd', runLocal: true, cwd: '  demo-workdir  ' },
    hosts
  );
  assert.deepEqual(localDir.local, { cwd: 'demo-workdir' });
  assert.equal(localDir.untargeted, false);

  const mixed = planSnippetLaunch(
    { command: 'pwd', runLocal: true, cwd: 'demo-workdir', targets: ['alpha', 'gone', 'beta'] },
    hosts
  );
  assert.deepEqual(mixed.local, { cwd: 'demo-workdir' });
  assert.deepEqual(mixed.hosts, [alpha, beta]);
  assert.deepEqual(mixed.missingHostIds, ['gone']);
  assert.equal(mixed.untargeted, false);

  const oneHost = planSnippetLaunch({ command: 'uptime', targets: ['alpha'] }, hosts);
  assert.equal(oneHost.local, null);
  assert.deepEqual(oneHost.hosts, [alpha]);
  assert.deepEqual(oneHost.missingHostIds, []);
  assert.equal(oneHost.untargeted, false);

  const manyHosts = planSnippetLaunch({ command: 'uptime', targets: ['beta', 'alpha'] }, hosts);
  assert.equal(manyHosts.local, null);
  assert.deepEqual(manyHosts.hosts, [beta, alpha]);
  assert.equal(manyHosts.untargeted, false);

  const neither = planSnippetLaunch({ command: 'ls' }, hosts);
  assert.equal(neither.local, null);
  assert.deepEqual(neither.hosts, []);
  assert.deepEqual(neither.missingHostIds, []);
  assert.equal(neither.untargeted, true);

  const staleCwd = planSnippetLaunch(
    { command: 'pwd', runLocal: false, cwd: 'demo-workdir' },
    hosts
  );
  assert.equal(staleCwd.local, null);
  assert.equal(staleCwd.untargeted, true);

  const missingOnly = planSnippetLaunch({ command: 'uptime', targets: ['gone'] }, hosts);
  assert.equal(missingOnly.local, null);
  assert.deepEqual(missingOnly.hosts, []);
  assert.deepEqual(missingOnly.missingHostIds, ['gone']);
  assert.equal(missingOnly.untargeted, false);
});
