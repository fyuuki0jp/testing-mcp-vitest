import { describe, test, expect } from 'vitest';
import { isValidValue } from '../../src/utils/validation';
import { Column } from '../../src/types';

describe('isValidValue', () => {
  describe('continues type validation', () => {
    test('should validate single range correctly', () => {
      const column: Column = {
        name: 'age',
        type: 'number',
        valueType: 'continues',
        values: { min: 18, max: 65 }
      };

      expect(isValidValue(column, 17)).toBe(false);
      expect(isValidValue(column, 18)).toBe(true);
      expect(isValidValue(column, 30)).toBe(true);
      expect(isValidValue(column, 65)).toBe(true);
      expect(isValidValue(column, 66)).toBe(false);
    });

    test('should validate multiple ranges correctly', () => {
      const column: Column = {
        name: 'workHours',
        type: 'number',
        valueType: 'continues',
        values: {
          ranges: [
            { min: 9, max: 12 },
            { min: 14, max: 17 }
          ]
        }
      };

      expect(isValidValue(column, 8)).toBe(false);
      expect(isValidValue(column, 9)).toBe(true);
      expect(isValidValue(column, 11)).toBe(true);
      expect(isValidValue(column, 12)).toBe(true);
      expect(isValidValue(column, 13)).toBe(false);
      expect(isValidValue(column, 14)).toBe(true);
      expect(isValidValue(column, 16)).toBe(true);
      expect(isValidValue(column, 17)).toBe(true);
      expect(isValidValue(column, 18)).toBe(false);
    });

    test('should handle missing min value', () => {
      const column: Column = {
        name: 'maxOnly',
        type: 'number',
        valueType: 'continues',
        values: { max: 100 }
      };

      expect(isValidValue(column, -1000)).toBe(true);
      expect(isValidValue(column, 50)).toBe(true);
      expect(isValidValue(column, 100)).toBe(true);
      expect(isValidValue(column, 101)).toBe(false);
    });

    test('should handle missing max value', () => {
      const column: Column = {
        name: 'minOnly',
        type: 'number',
        valueType: 'continues',
        values: { min: 0 }
      };

      expect(isValidValue(column, -1)).toBe(false);
      expect(isValidValue(column, 0)).toBe(true);
      expect(isValidValue(column, 1000)).toBe(true);
    });

    test('should handle missing min and max values', () => {
      const column: Column = {
        name: 'noLimits',
        type: 'number',
        valueType: 'continues',
        values: {}
      };

      expect(isValidValue(column, -1000)).toBe(true);
      expect(isValidValue(column, 0)).toBe(true);
      expect(isValidValue(column, 1000)).toBe(true);
    });
  });

  describe('category type validation', () => {
    test('should validate against valid values', () => {
      const column: Column = {
        name: 'status',
        type: 'string',
        valueType: 'category',
        values: {
          valid: ['active', 'inactive', 'pending']
        }
      };

      expect(isValidValue(column, 'active')).toBe(true);
      expect(isValidValue(column, 'inactive')).toBe(true);
      expect(isValidValue(column, 'pending')).toBe(true);
      expect(isValidValue(column, 'deleted')).toBe(true); // defaults to valid if not in invalid
    });

    test('should validate against invalid values', () => {
      const column: Column = {
        name: 'status',
        type: 'string',
        valueType: 'category',
        values: {
          invalid: ['deleted', '', null]
        }
      };

      expect(isValidValue(column, 'deleted')).toBe(false);
      expect(isValidValue(column, '')).toBe(false);
      expect(isValidValue(column, null)).toBe(false);
      expect(isValidValue(column, 'active')).toBe(true); // not in invalid list
    });

    test('should validate against both valid and invalid values', () => {
      const column: Column = {
        name: 'role',
        type: 'string',
        valueType: 'category',
        values: {
          valid: ['admin', 'user', 'guest'],
          invalid: ['root', 'superuser', '']
        }
      };

      expect(isValidValue(column, 'admin')).toBe(true);
      expect(isValidValue(column, 'user')).toBe(true);
      expect(isValidValue(column, 'guest')).toBe(true);
      expect(isValidValue(column, 'root')).toBe(false);
      expect(isValidValue(column, 'superuser')).toBe(false);
      expect(isValidValue(column, '')).toBe(false);
      expect(isValidValue(column, 'unknown')).toBe(true); // defaults to valid
    });

    test('should handle boolean values', () => {
      const column: Column = {
        name: 'isActive',
        type: 'boolean',
        valueType: 'category',
        values: {
          valid: [true, false],
          invalid: [null, 'true', 'false']
        }
      };

      expect(isValidValue(column, true)).toBe(true);
      expect(isValidValue(column, false)).toBe(true);
      expect(isValidValue(column, null)).toBe(false);
      expect(isValidValue(column, 'true')).toBe(false);
      expect(isValidValue(column, 'false')).toBe(false);
    });

    test('should handle numeric values in categories', () => {
      const column: Column = {
        name: 'priority',
        type: 'number',
        valueType: 'category',
        values: {
          valid: [1, 2, 3, 4, 5],
          invalid: [0, 6, 7, 8, 9, 10]
        }
      };

      expect(isValidValue(column, 1)).toBe(true);
      expect(isValidValue(column, 3)).toBe(true);
      expect(isValidValue(column, 5)).toBe(true);
      expect(isValidValue(column, 0)).toBe(false);
      expect(isValidValue(column, 6)).toBe(false);
      expect(isValidValue(column, 11)).toBe(true); // not in either list, defaults to valid
    });

    test('should handle empty valid and invalid arrays', () => {
      const column: Column = {
        name: 'empty',
        type: 'string',
        valueType: 'category',
        values: {
          valid: [],
          invalid: []
        }
      };

      expect(isValidValue(column, 'anything')).toBe(true);
      expect(isValidValue(column, '')).toBe(true);
      expect(isValidValue(column, null)).toBe(true);
    });
  });

  test('should default to valid for unknown value types', () => {
    const column: Column = {
      name: 'unknown',
      type: 'unknown',
      valueType: 'unknown' as any,
      values: {}
    };

    expect(isValidValue(column, 'anything')).toBe(true);
  });
});