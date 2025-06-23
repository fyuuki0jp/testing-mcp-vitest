import { describe, test, expect } from 'vitest';
import { generateBoundaryValues } from '../../src/generators/boundary-values';
import { Column } from '../../src/types';

describe('generateBoundaryValues', () => {
  test('should generate boundary values for single range', () => {
    const column: Column = {
      name: 'age',
      type: 'number',
      valueType: 'continues',
      values: {
        min: 18,
        max: 65
      }
    };

    const result = generateBoundaryValues(column);
    
    expect(result).toEqual([
      17,  // min - 1
      18,  // min
      19,  // min + 1
      41,  // middle (18 + 65) / 2
      64,  // max - 1
      65,  // max
      66   // max + 1
    ]);
  });

  test('should generate boundary values for multiple ranges', () => {
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

    const result = generateBoundaryValues(column);
    
    expect(result).toEqual([
      8,   // range1 min - 1
      9,   // range1 min
      10,  // range1 min + 1
      10,  // range1 middle (9 + 12) / 2
      11,  // range1 max - 1
      12,  // range1 max
      13,  // range1 max + 1
      13,  // gap middle between ranges
      13,  // range2 min - 1
      14,  // range2 min
      15,  // range2 min + 1
      15,  // range2 middle (14 + 17) / 2
      16,  // range2 max - 1
      17,  // range2 max
      18   // range2 max + 1
    ]);
  });

  test('should return empty array for category type', () => {
    const column: Column = {
      name: 'status',
      type: 'string',
      valueType: 'category',
      values: {
        valid: ['active', 'inactive'],
        invalid: ['deleted']
      }
    };

    const result = generateBoundaryValues(column);
    
    expect(result).toEqual([]);
  });

  test('should handle edge case with same min and max', () => {
    const column: Column = {
      name: 'fixed',
      type: 'number',
      valueType: 'continues',
      values: {
        min: 5,
        max: 5
      }
    };

    const result = generateBoundaryValues(column);
    
    expect(result).toEqual([
      4, // min - 1
      5, // min
      6, // min + 1
      5, // middle
      4, // max - 1
      5, // max
      6  // max + 1
    ]);
  });

  test('should handle missing min or max values', () => {
    const column: Column = {
      name: 'incomplete',
      type: 'number',
      valueType: 'continues',
      values: {
        min: 10
        // missing max
      }
    };

    const result = generateBoundaryValues(column);
    
    expect(result).toEqual([]);
  });
});