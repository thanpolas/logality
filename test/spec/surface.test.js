/**
 * @fileOverview Test the API surface, library properly exporting methods.
 */

const Logality = require('../..');

describe('API Surface', () => {
  test('Logality is a function', () => {
    expect(typeof Logality).toBe('function');
  });
  test('Logality instantiates properly', () => {
    const logality = new Logality();
    expect(typeof logality.get).toBe('function');
  });
  test('Logality instantiates without the "new" keyword', () => {
    const logality = Logality();
    expect(typeof logality.get).toBe('function');
  });
  test('Logality instance has expected methods exported', () => {
    const logality = Logality();

    expect(typeof logality.get).toBe('function');
    expect(typeof logality.log).toBe('function');
  });
});
