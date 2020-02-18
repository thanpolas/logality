/**
 * @fileoverview Test utility functions.
 */
const util = require('../../app/utils');

describe('Utility Functions', () => {
  describe('assignPath() Helper', () => {
    test('Will assign at root as expected', () => {
      const target = {};

      util.assignPath('one', target, 1);

      expect(target).toHaveProperty('one');
      expect(target.one).toEqual(1);
    });
    test('Will assign at level 1', () => {
      const target = {};

      util.assignPath('one.two', target, 'two');

      expect(target).toHaveProperty('one');
      expect(target.one).toHaveProperty('two');
      expect(target.one.two).toEqual('two');
    });
    test('Will assign at level 2', () => {
      const target = {};

      util.assignPath('one.two.three', target, 'two');

      expect(target).toHaveProperty('one');
      expect(target.one).toHaveProperty('two');
      expect(target.one.two).toHaveProperty('three');
      expect(target.one.two.three).toEqual('two');
    });
    test('Will assign at level 3', () => {
      const target = {};

      util.assignPath('one.two.three.four', target, 'two');

      expect(target).toHaveProperty('one');
      expect(target.one).toHaveProperty('two');
      expect(target.one.two).toHaveProperty('three');
      expect(target.one.two.three).toHaveProperty('four');
      expect(target.one.two.three.four).toEqual('two');
    });

    test('Will overwrite', () => {
      const target = {
        one: 1,
      };

      util.assignPath('one', target, 'two');

      expect(target).toHaveProperty('one');
      expect(target.one).toEqual('two');
    });

    test('Will not have sideeffects on siblings', () => {
      const target = {
        one: {
          first: 1,
        },
      };

      util.assignPath('one.second', target, 'two');

      expect(target).toHaveProperty('one');
      expect(target.one).toHaveProperty('first');
      expect(target.one).toHaveProperty('second');
      expect(target.one.first).toEqual(1);
      expect(target.one.second).toEqual('two');
    });
  });
});
