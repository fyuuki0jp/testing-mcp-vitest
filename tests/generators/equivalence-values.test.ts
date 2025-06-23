import { describe, test, expect } from 'vitest';
import { generateEquivalenceValues } from '../../src/generators/equivalence-values';
import { Column } from '../../src/types';

describe('generateEquivalenceValues', () => {
  test('should generate values for category type with valid and invalid values', () => {
    const column: Column = {
      name: 'status',
      type: 'string',
      valueType: 'category',
      values: {
        valid: ['active', 'inactive', 'pending'],
        invalid: ['deleted', '', null]
      }
    };

    const result = generateEquivalenceValues(column);
    
    expect(result).toEqual(['active', 'inactive', 'pending', 'deleted', '', null]);
  });

  test('should generate values for category type with only valid values', () => {
    const column: Column = {
      name: 'role',
      type: 'string',
      valueType: 'category',
      values: {
        valid: ['admin', 'user', 'guest']
      }
    };

    const result = generateEquivalenceValues(column);
    
    expect(result).toEqual(['admin', 'user', 'guest']);
  });

  test('should generate values for category type with only invalid values', () => {
    const column: Column = {
      name: 'forbidden',
      type: 'string',
      valueType: 'category',
      values: {
        invalid: ['root', 'superuser', '']
      }
    };

    const result = generateEquivalenceValues(column);
    
    expect(result).toEqual(['root', 'superuser', '']);
  });

  test('should return empty array for continues type', () => {
    const column: Column = {
      name: 'age',
      type: 'number',
      valueType: 'continues',
      values: {
        min: 18,
        max: 65
      }
    };

    const result = generateEquivalenceValues(column);
    
    expect(result).toEqual([]);
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

    const result = generateEquivalenceValues(column);
    
    expect(result).toEqual([]);
  });

  test('should handle missing valid and invalid arrays', () => {
    const column: Column = {
      name: 'missing',
      type: 'string',
      valueType: 'category',
      values: {}
    };

    const result = generateEquivalenceValues(column);
    
    expect(result).toEqual([]);
  });

  test('should handle boolean values', () => {
    const column: Column = {
      name: 'isActive',
      type: 'boolean',
      valueType: 'category',
      values: {
        valid: [true, false],
        invalid: [null, 'true', 'false', 1, 0]
      }
    };

    const result = generateEquivalenceValues(column);
    
    expect(result).toEqual([true, false, null, 'true', 'false', 1, 0]);
  });
});