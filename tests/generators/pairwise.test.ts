import { describe, test, expect, vi } from 'vitest';
import { generatePairwiseCombinations } from '../../src/generators/pairwise';
import { Column } from '../../src/types';

describe('generatePairwiseCombinations', () => {
  test('should generate all combinations for 2 parameters', () => {
    const columnsWithValues = [
      {
        column: {
          name: 'age',
          type: 'number',
          valueType: 'continues',
          values: { min: 18, max: 25 }
        } as Column,
        values: [17, 18, 26] // invalid, valid, invalid
      },
      {
        column: {
          name: 'status',
          type: 'string',
          valueType: 'category',
          values: { valid: ['active'], invalid: ['inactive'] }
        } as Column,
        values: ['active', 'inactive']
      }
    ];

    const result = generatePairwiseCombinations(columnsWithValues);
    
    expect(result).toHaveLength(6); // 3 * 2 = 6 combinations
    expect(result[0]).toHaveProperty('inputs');
    expect(result[0]).toHaveProperty('expected');
    expect(result[0]).toHaveProperty('description');
    
    // Check that all combinations are present
    const inputCombinations = result.map(tc => tc.inputs);
    expect(inputCombinations).toContainEqual({ age: 17, status: 'active' });
    expect(inputCombinations).toContainEqual({ age: 17, status: 'inactive' });
    expect(inputCombinations).toContainEqual({ age: 18, status: 'active' });
    expect(inputCombinations).toContainEqual({ age: 18, status: 'inactive' });
    expect(inputCombinations).toContainEqual({ age: 26, status: 'active' });
    expect(inputCombinations).toContainEqual({ age: 26, status: 'inactive' });
  });

  test('should validate combinations correctly', () => {
    const columnsWithValues = [
      {
        column: {
          name: 'age',
          type: 'number',
          valueType: 'continues',
          values: { min: 18, max: 65 }
        } as Column,
        values: [18, 65] // both valid
      },
      {
        column: {
          name: 'status',
          type: 'string',
          valueType: 'category',
          values: { valid: ['active'], invalid: ['deleted'] }
        } as Column,
        values: ['active', 'deleted']
      }
    ];

    const result = generatePairwiseCombinations(columnsWithValues);
    
    const validCases = result.filter(tc => tc.expected === 'valid');
    const invalidCases = result.filter(tc => tc.expected === 'invalid');
    
    expect(validCases).toHaveLength(2); // age valid + status valid
    expect(invalidCases).toHaveLength(2); // age valid + status invalid
    
    expect(validCases[0].inputs).toEqual({ age: 18, status: 'active' });
    expect(validCases[1].inputs).toEqual({ age: 65, status: 'active' });
  });

  test('should use pairwise approach for 4+ parameters', () => {
    // Mock Math.random to make test deterministic
    const mockRandom = vi.spyOn(Math, 'random');
    mockRandom.mockReturnValue(0.5); // Always return middle value

    const columnsWithValues = [
      {
        column: {
          name: 'param1',
          type: 'string',
          valueType: 'category',
          values: { valid: ['a'], invalid: ['b'] }
        } as Column,
        values: ['a', 'b']
      },
      {
        column: {
          name: 'param2',
          type: 'string',
          valueType: 'category',
          values: { valid: ['x'], invalid: ['y'] }
        } as Column,
        values: ['x', 'y']
      },
      {
        column: {
          name: 'param3',
          type: 'string',
          valueType: 'category',
          values: { valid: ['1'], invalid: ['2'] }
        } as Column,
        values: ['1', '2']
      },
      {
        column: {
          name: 'param4',
          type: 'string',
          valueType: 'category',
          values: { valid: ['m'], invalid: ['n'] }
        } as Column,
        values: ['m', 'n']
      }
    ];

    const result = generatePairwiseCombinations(columnsWithValues);
    
    // Should generate fewer test cases than full combination (2^4 = 16)
    expect(result.length).toBeLessThan(16);
    expect(result.length).toBeGreaterThan(0);
    
    // Each test case should have inputs for all parameters
    result.forEach(testCase => {
      expect(testCase.inputs).toHaveProperty('param1');
      expect(testCase.inputs).toHaveProperty('param2');
      expect(testCase.inputs).toHaveProperty('param3');
      expect(testCase.inputs).toHaveProperty('param4');
      expect(testCase.description).toContain('Pairwise test');
    });

    mockRandom.mockRestore();
  });

  test('should handle single parameter', () => {
    const columnsWithValues = [
      {
        column: {
          name: 'single',
          type: 'string',
          valueType: 'category',
          values: { valid: ['valid'], invalid: ['invalid'] }
        } as Column,
        values: ['valid', 'invalid']
      }
    ];

    const result = generatePairwiseCombinations(columnsWithValues);
    
    expect(result).toHaveLength(2);
    expect(result[0].inputs).toEqual({ single: 'valid' });
    expect(result[1].inputs).toEqual({ single: 'invalid' });
    expect(result[0].expected).toBe('valid');
    expect(result[1].expected).toBe('invalid');
  });

  test('should handle multiple ranges validation', () => {
    const columnsWithValues = [
      {
        column: {
          name: 'score',
          type: 'number',
          valueType: 'continues',
          values: { 
            ranges: [
              { min: 0, max: 40 },   // fail range
              { min: 60, max: 100 }  // pass range
            ]
          }
        } as Column,
        values: [25, 50, 80] // valid, invalid (gap), valid
      }
    ];

    const result = generatePairwiseCombinations(columnsWithValues);
    
    expect(result).toHaveLength(3);
    expect(result.find(tc => tc.inputs.score === 25)?.expected).toBe('valid');
    expect(result.find(tc => tc.inputs.score === 50)?.expected).toBe('invalid');
    expect(result.find(tc => tc.inputs.score === 80)?.expected).toBe('valid');
  });
});