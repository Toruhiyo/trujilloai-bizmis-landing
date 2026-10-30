// Offline tests: node --test film/scripts/el-guard.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { assertEstimate, assertUnderCeiling, filmTesterToken, installTesterToken, limit, runSpent } from './el-guard.mjs';

test('period ceiling', () => {
  assert.equal(assertUnderCeiling(400000, 400000), 400000);
  assert.throws(() => assertUnderCeiling(1060008, 400000));
});
test('overrides need EL_I_KNOW=1', () => {
  assert.throws(() => limit('EL_CREDIT_CAP', 5000, { EL_CREDIT_CAP: '9000' }));
  assert.equal(limit('EL_CREDIT_CAP', 5000, { EL_CREDIT_CAP: '9000', EL_I_KNOW: '1' }), 9000);
});
test('run cap and live spend', () => {
  assert.throws(() => assertEstimate(5001, 'x', 5000));
  assert.equal(runSpent(100, 120000), 800);
});
test('no token, no recording', () => {
  assert.throws(() => filmTesterToken({}, '/nonexistent'));
  assert.equal(filmTesterToken({ BIZMIS_FILM_TEST_TOKEN: 'bt1.a.b' }), 'bt1.a.b');
});
test('the token reaches the widget key', () => {
  const set = {};
  globalThis.window = { sessionStorage: { setItem: (k, v) => { set[k] = v; } } };
  installTesterToken('bt1.a.b');
  assert.deepEqual(set, { bizmis_test_token: 'bt1.a.b' });
  delete globalThis.window;
});
