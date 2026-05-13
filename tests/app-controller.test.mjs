import test from 'node:test';
import assert from 'node:assert/strict';

import { createMoneyConverterApp } from '../src/js/app-controller.js';

function createMockField(value = '') {
  const classes = new Set();

  return {
    value,
    classList: {
      add(name) {
        classes.add(name);
      },
      remove(name) {
        classes.delete(name);
      }
    },
    setAttribute() {},
    removeAttribute() {},
    addEventListener() {},
    select() {}
  };
}

test('refreshRates recalculates displayed conversions from the active field', async () => {
  const fields = {
    CDF: createMockField(),
    XAF: createMockField(),
    EUR: createMockField(),
    USD: createMockField('10')
  };

  const app = createMoneyConverterApp({
    fields,
    statusEl: {},
    updatedAtEl: {},
    refreshBtn: {},
    fetchRates: async () => ({
      ok: true,
      rates: {
        USD: 1,
        EUR: 2,
        XAF: 100,
        CDF: 1000
      }
    })
  });

  app.handleInput('USD');

  assert.equal(fields.EUR.value, '9,2');
  assert.equal(fields.XAF.value, '6\u202f000');
  assert.equal(fields.CDF.value, '22\u202f700');

  await app.refreshRates();

  assert.equal(fields.EUR.value, '20');
  assert.equal(fields.XAF.value, '1\u202f000');
  assert.equal(fields.CDF.value, '10\u202f000');
});
