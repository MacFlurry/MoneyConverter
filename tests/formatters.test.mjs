import test from 'node:test';
import assert from 'node:assert/strict';

import { parseLocaleNumber, formatNumber } from '../src/js/formatters.js';

test('parseLocaleNumber accepts french decimal format', () => {
  assert.equal(parseLocaleNumber('1 234,56'), 1234.56);
  assert.equal(parseLocaleNumber('99.25'), 99.25);
  assert.ok(Number.isNaN(parseLocaleNumber('abc')));
});

test('parseLocaleNumber rejects partially numeric input', () => {
  assert.ok(Number.isNaN(parseLocaleNumber('12abc')));
  assert.ok(Number.isNaN(parseLocaleNumber('1,2,3')));
  assert.ok(Number.isNaN(parseLocaleNumber('1.234,56')));
});

test('formatNumber rounds to 4 decimals', () => {
  assert.equal(formatNumber(12.123456), '12,1235');
});
