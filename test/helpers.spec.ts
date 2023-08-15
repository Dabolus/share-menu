import { expect } from '@open-wc/testing';
import {
  updateArrayAttribute,
  updateBooleanAttribute,
  updateStringAttribute,
} from '../src/helpers.js';

describe('helpers', () => {
  describe('updateStringAttribute', () => {
    [
      { value: 'val', expected: 'val' },
      { value: null, expected: null },
      { value: undefined, expected: null },
    ].forEach(({ value, expected }) => {
      it(`${
        expected ? 'sets' : 'removes'
      } the attribute if the provided value is ${value}`, () => {
        const testDiv = document.createElement('div');
        updateStringAttribute(testDiv, 'test', value);
        expect(testDiv.getAttribute('test')).to.equal(expected);
      });
    });
  });

  describe('updateArrayAttribute', () => {
    [
      { value: ['val1'], expected: 'val1' },
      { value: ['val1', 'val2'], expected: 'val1,val2' },
      { value: null, expected: null },
      { value: undefined, expected: null },
    ].forEach(({ value, expected }) => {
      it(`${
        expected ? 'encodes and sets' : 'removes'
      } the attribute if the provided value is ${value}`, () => {
        const testDiv = document.createElement('div');
        updateArrayAttribute(testDiv, 'test', value);
        expect(testDiv.getAttribute('test')).to.equal(expected);
      });
    });
  });

  describe('updateBooleanAttribute', () => {
    [
      { value: true, expected: true },
      { value: false, expected: false },
      { value: null, expected: false },
      { value: undefined, expected: false },
    ].forEach(({ value, expected }) => {
      it(`${
        expected ? 'sets' : 'removes'
      } the attribute if the provided value is ${value}`, () => {
        const testDiv = document.createElement('div');
        updateBooleanAttribute(testDiv, 'test', value);
        expect(testDiv.hasAttribute('test')).to.equal(expected);
      });
    });
  });
});
