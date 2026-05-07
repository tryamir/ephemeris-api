import assert from 'node:assert/strict';
import test from 'node:test';
import {
  dateToJulianDay,
  findAngularRootsInInterval,
  normalizeDegrees,
  signedAngleDegrees,
} from './exactTiming.js';
import { calculateMoonPhases } from './moonPhases.js';

test('calculates all full moons in a calendar-year range', () => {
  const startUTC = '2026-01-01T00:00:00Z';
  const endUTC = '2027-01-01T00:00:00Z';
  const result = calculateMoonPhases({ startUTC, endUTC, phases: ['full'] });

  assert.equal(result.events.length, 13);
  assert.equal(result.events[0]?.exactUTC, '2026-01-03T10:02:55Z');
  assert.equal(result.events.at(-1)?.exactUTC, '2026-12-24T01:28:17Z');

  for (const event of result.events) {
    assert.equal(event.phase, 'full');
    assert.ok(event.exactUTC >= startUTC);
    assert.ok(event.exactUTC < endUTC);
    assert.equal(typeof event.sunLongitude, 'number');
    assert.equal(typeof event.moonLongitude, 'number');

    const elongationError = signedAngleDegrees(normalizeDegrees(event.moonLongitude - event.sunLongitude) - 180);
    assert.ok(Math.abs(elongationError) < 0.001);
  }
});

test('calculates all new and full moons in a calendar-year range', () => {
  const startUTC = '2026-01-01T00:00:00Z';
  const endUTC = '2027-01-01T00:00:00Z';
  const result = calculateMoonPhases({ startUTC, endUTC, phases: ['new', 'full'] });
  const newMoons = result.events.filter(event => event.phase === 'new');
  const fullMoons = result.events.filter(event => event.phase === 'full');

  assert.equal(result.events.length, 25);
  assert.equal(newMoons.length, 12);
  assert.equal(fullMoons.length, 13);
  assert.equal(result.events[0]?.phase, 'full');
  assert.equal(result.events[0]?.exactUTC, '2026-01-03T10:02:55Z');
  assert.equal(result.events.at(-1)?.phase, 'full');
  assert.equal(result.events.at(-1)?.exactUTC, '2026-12-24T01:28:17Z');

  for (let i = 1; i < result.events.length; i++) {
    assert.ok(result.events[i - 1]!.exactUTC <= result.events[i]!.exactUTC);
  }

  for (const event of result.events) {
    assert.ok(event.exactUTC >= startUTC);
    assert.ok(event.exactUTC < endUTC);
    assert.equal(typeof event.sunLongitude, 'number');
    assert.equal(typeof event.moonLongitude, 'number');

    const targetAngle = event.phase === 'new' ? 0 : 180;
    const elongationError = signedAngleDegrees(normalizeDegrees(event.moonLongitude - event.sunLongitude) - targetAngle);
    assert.ok(Math.abs(elongationError) < 0.001);
  }
});

test('angular root search treats intervals as start-inclusive and end-exclusive', () => {
  const start = dateToJulianDay(new Date('2026-01-01T00:00:00Z'));
  const end = start + 2;
  const angleFn = (julianDay: number) => (julianDay - start) * 90;

  assert.deepEqual(findAngularRootsInInterval(angleFn, 0, start, end), [start]);
  assert.deepEqual(findAngularRootsInInterval(angleFn, 180, start, end), []);
});
