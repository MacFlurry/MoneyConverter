import test from 'node:test';
import assert from 'node:assert/strict';

import { setFieldValidity } from '../src/js/ui.js';

function createMockField() {
  const classes = new Set();
  return {
    classList: {
      add(name) {
        classes.add(name);
      },
      remove(name) {
        classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      }
    },
    attrs: {},
    setAttribute(name, value) {
      this.attrs[name] = value;
    },
    removeAttribute(name) {
      delete this.attrs[name];
    }
  };
}

test('setFieldValidity marks input invalid and sets aria-invalid', () => {
  const field = createMockField();
  setFieldValidity(field, true);

  assert.equal(field.classList.contains('invalid'), true);
  assert.equal(field.attrs['aria-invalid'], 'true');
});

test('setFieldValidity clears invalid state', () => {
  const field = createMockField();
  setFieldValidity(field, true);
  setFieldValidity(field, false);

  assert.equal(field.classList.contains('invalid'), false);
  assert.equal(field.attrs['aria-invalid'], undefined);
});
