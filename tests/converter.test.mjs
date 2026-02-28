import test from 'node:test';
import assert from 'node:assert/strict';

import { toUSD, fromUSD } from '../src/js/converter.js';

const rates = {
  USD: 1,
  EUR: 0.92,
  XAF: 600,
  CDF: 2270
};

test('toUSD converts source currency to USD', () => {
  assert.equal(toUSD(92, 'EUR', rates), 100);
  assert.equal(toUSD(600, 'XAF', rates), 1);
  assert.equal(toUSD(2270, 'CDF', rates), 1);
  assert.equal(toUSD(10, 'USD', rates), 10);
});

test('fromUSD converts USD to all currencies', () => {
  const converted = fromUSD(2, rates);
  assert.deepEqual(converted, {
    USD: 2,
    EUR: 1.84,
    XAF: 1200,
    CDF: 4540
  });
});
