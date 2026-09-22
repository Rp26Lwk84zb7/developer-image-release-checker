import test from 'node:test';
import assert from 'node:assert/strict';
import { decideRelease, parseReleaseEvent } from '../src/release_policy.js';

test('release decision passes when the compressed asset fits the build gate', () => {
  const event = parseReleaseEvent({
    buildId: 'build_1',
    image: { base64: 'AA' },
    targetBytes: 1200,
    maxWidth: 64,
    maxHeight: 64
  });

  const decision = decideRelease(event, { sizeBytes: 900, width: 48, height: 48 });

  assert.equal(decision.status, 'release');
  assert.deepEqual(decision.notes, ['release gate passed']);
});

test('release decision holds when the diagnostics exceed the target', () => {
  const event = parseReleaseEvent({
    buildId: 'build_2',
    image: { base64: 'AA' },
    targetBytes: 800,
    maxWidth: 64,
    maxHeight: 64
  });

  const decision = decideRelease(event, { sizeBytes: 901, width: 48, height: 48 });

  assert.equal(decision.status, 'hold');
  assert.match(decision.notes[0], /above target/);
});

test('image reference accepts supported forms and rejects a bare string', () => {
  for (const image of [{ base64: 'AA' }, { url: 'https://example.com/image.png' }, { image_id: 'img_1' }]) {
    assert.deepEqual(parseReleaseEvent({ buildId: 'build_3', image, targetBytes: 100 }).image, image);
  }
  assert.throws(() => parseReleaseEvent({ buildId: 'build_3', image: 'AA', targetBytes: 100 }));
});
