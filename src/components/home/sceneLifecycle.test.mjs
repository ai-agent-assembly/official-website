import assert from 'node:assert/strict';
import {test} from 'node:test';
import {
  createFrameGate,
  projectSafeRects,
  shouldAnimate,
} from './sceneLifecycle.mjs';

test('a frame gate has one chain across duplicate starts, stop and restart', () => {
  let next = 0;
  let ticks = 0;
  const pending = new Map();
  const cancelled = [];
  const gate = createFrameGate(
    (callback) => {
      pending.set(++next, callback);
      return next;
    },
    (handle) => {
      cancelled.push(handle);
      pending.delete(handle);
    },
    () => {
      ticks += 1;
    },
  );
  gate.start();
  gate.start();
  assert.equal(pending.size, 1);
  const first = pending.get(1);
  pending.delete(1);
  first();
  assert.equal(ticks, 1);
  assert.equal(pending.size, 1);
  gate.stop();
  assert.equal(gate.isRunning(), false);
  assert.deepEqual(cancelled, [2]);
  assert.equal(pending.size, 0);
  gate.start();
  assert.equal(pending.size, 1);
  const resumed = pending.get(3);
  pending.delete(3);
  resumed();
  assert.equal(ticks, 2);
  gate.stop();
  assert.equal(pending.size, 0);
});

test('a stopped callback cannot revive a cancelled chain', () => {
  let callback;
  let requests = 0;
  const gate = createFrameGate(
    (next) => {
      callback = next;
      return ++requests;
    },
    () => {},
    () => {
      throw new Error('stopped frame must not tick');
    },
  );
  gate.start();
  gate.stop();
  callback();
  assert.equal(requests, 1);
});

test('motion requires every live condition', () => {
  const live = {reduced: false, narrow: false, inView: true, pageVisible: true};
  assert.equal(shouldAnimate(live), true);
  for (const changed of [
    {reduced: true},
    {narrow: true},
    {inView: false},
    {pageVisible: false},
  ])
    assert.equal(shouldAnimate({...live, ...changed}), false);
});

test('safe rectangles use canvas-local CSS pixels and 24px clearance', () => {
  const root = {left: 100, top: 40, width: 800, height: 600};
  const text = {left: 135, top: 60, width: 300, height: 70};
  assert.deepEqual(projectSafeRects(root, [text]), [
    {x: 11, y: -4, width: 348, height: 118},
  ]);
  assert.deepEqual(
    projectSafeRects(root, [text, {...text, width: 0}]).length,
    1,
  );
});
