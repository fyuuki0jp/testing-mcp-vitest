import { describe, test, expect } from 'vitest';
import { cartesianProduct } from '../../src/utils/cartesian';

describe('cartesianProduct', () => {
  test('should generate cartesian product for two arrays', () => {
    const arrays = [
      ['a', 'b'],
      [1, 2]
    ];

    const result = cartesianProduct(arrays);

    expect(result).toEqual([
      ['a', 1],
      ['a', 2],
      ['b', 1],
      ['b', 2]
    ]);
  });

  test('should generate cartesian product for three arrays', () => {
    const arrays = [
      ['x', 'y'],
      [1, 2],
      ['A', 'B']
    ];

    const result = cartesianProduct(arrays);

    expect(result).toEqual([
      ['x', 1, 'A'],
      ['x', 1, 'B'],
      ['x', 2, 'A'],
      ['x', 2, 'B'],
      ['y', 1, 'A'],
      ['y', 1, 'B'],
      ['y', 2, 'A'],
      ['y', 2, 'B']
    ]);
  });

  test('should handle single array', () => {
    const arrays = [
      ['a', 'b', 'c']
    ];

    const result = cartesianProduct(arrays);

    expect(result).toEqual([
      ['a'],
      ['b'],
      ['c']
    ]);
  });

  test('should handle empty array', () => {
    const arrays: any[][] = [];

    const result = cartesianProduct(arrays);

    expect(result).toEqual([[]]);
  });

  test('should handle arrays with one empty array', () => {
    const arrays = [
      ['a', 'b'],
      [],
      ['x', 'y']
    ];

    const result = cartesianProduct(arrays);

    expect(result).toEqual([]);
  });

  test('should handle arrays with single elements', () => {
    const arrays = [
      ['a'],
      ['1'],
      ['x']
    ];

    const result = cartesianProduct(arrays);

    expect(result).toEqual([
      ['a', '1', 'x']
    ]);
  });

  test('should handle mixed data types', () => {
    const arrays = [
      [true, false],
      [1, 2],
      ['test', null]
    ];

    const result = cartesianProduct(arrays);

    expect(result).toEqual([
      [true, 1, 'test'],
      [true, 1, null],
      [true, 2, 'test'],
      [true, 2, null],
      [false, 1, 'test'],
      [false, 1, null],
      [false, 2, 'test'],
      [false, 2, null]
    ]);
  });

  test('should handle arrays with different lengths', () => {
    const arrays = [
      ['a'],
      [1, 2, 3, 4],
      ['x', 'y']
    ];

    const result = cartesianProduct(arrays);

    expect(result).toHaveLength(8); // 1 * 4 * 2 = 8
    expect(result).toEqual([
      ['a', 1, 'x'],
      ['a', 1, 'y'],
      ['a', 2, 'x'],
      ['a', 2, 'y'],
      ['a', 3, 'x'],
      ['a', 3, 'y'],
      ['a', 4, 'x'],
      ['a', 4, 'y']
    ]);
  });

  test('should handle large cartesian product correctly', () => {
    const arrays = [
      [1, 2, 3],
      ['a', 'b', 'c'],
      [true, false]
    ];

    const result = cartesianProduct(arrays);

    expect(result).toHaveLength(18); // 3 * 3 * 2 = 18
    expect(result[0]).toEqual([1, 'a', true]);
    expect(result[17]).toEqual([3, 'c', false]);
  });
});