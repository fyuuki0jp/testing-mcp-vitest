import { describe, test, expect } from 'vitest';
import { generateVitestCode } from '../../src/generators/vitest-code';
import { Specification, TestCase } from '../../src/types';

describe('generateVitestCode', () => {
  test('should generate Vitest code with valid and invalid test cases', () => {
    const spec: Specification = {
      type: 'model',
      name: 'UserProfile',
      columns: []
    };

    const testCases: TestCase[] = [
      {
        inputs: { age: 25, status: 'active' },
        expected: 'valid',
        description: 'Valid user profile'
      },
      {
        inputs: { age: 17, status: 'active' },
        expected: 'invalid',
        description: 'Underage user'
      }
    ];

    const result = generateVitestCode(spec, testCases);

    expect(result).toContain("import { describe, test, expect } from 'vitest';");
    expect(result).toContain("describe('Tests for UserProfile', () => {");
    expect(result).toContain("// Valid cases");
    expect(result).toContain("// Invalid cases");
    expect(result).toContain("test.each([");
    expect(result).toContain("{ inputs: { age: 25, status: \"active\" }, description: 'Valid user profile' }");
    expect(result).toContain("{ inputs: { age: 17, status: \"active\" }, description: 'Underage user' }");
    expect(result).toContain("'Valid case: $description'");
    expect(result).toContain("'Invalid case: $description'");
  });

  test('should generate code with only valid cases', () => {
    const spec: Specification = {
      type: 'module',
      name: 'Calculator',
      columns: []
    };

    const testCases: TestCase[] = [
      {
        inputs: { a: 5, b: 3 },
        expected: 'valid',
        description: 'Valid addition'
      }
    ];

    const result = generateVitestCode(spec, testCases);

    expect(result).toContain("describe('Tests for Calculator', () => {");
    expect(result).toContain("// Valid cases");
    expect(result).not.toContain("// Invalid cases");
    expect(result).toContain("{ inputs: { a: 5, b: 3 }, description: 'Valid addition' }");
    expect(result).toContain("'Valid case: $description'");
    expect(result).not.toContain("'Invalid case: $description'");
  });

  test('should generate code with only invalid cases', () => {
    const spec: Specification = {
      type: 'model',
      name: 'Validator',
      columns: []
    };

    const testCases: TestCase[] = [
      {
        inputs: { email: 'invalid-email' },
        expected: 'invalid',
        description: 'Invalid email format'
      }
    ];

    const result = generateVitestCode(spec, testCases);

    expect(result).toContain("describe('Tests for Validator', () => {");
    expect(result).not.toContain("// Valid cases");
    expect(result).toContain("// Invalid cases");
    expect(result).toContain("{ inputs: { email: \"invalid-email\" }, description: 'Invalid email format' }");
    expect(result).not.toContain("'Valid case: $description'");
    expect(result).toContain("'Invalid case: $description'");
  });

  test('should handle complex input values', () => {
    const spec: Specification = {
      type: 'model',
      name: 'ComplexModel',
      columns: []
    };

    const testCases: TestCase[] = [
      {
        inputs: { 
          str: 'test string',
          num: 42,
          bool: true,
          nullValue: null,
          array: [1, 2, 3],
          object: { nested: 'value' }
        },
        expected: 'valid',
        description: 'Complex valid case'
      }
    ];

    const result = generateVitestCode(spec, testCases);

    expect(result).toContain('str: "test string"');
    expect(result).toContain('num: 42');
    expect(result).toContain('bool: true');
    expect(result).toContain('nullValue: null');
    expect(result).toContain('array: [1,2,3]');
    expect(result).toContain('object: {"nested":"value"}');
  });

  test('should generate proper TODO comments', () => {
    const spec: Specification = {
      type: 'model',
      name: 'TestModel',
      columns: []
    };

    const testCases: TestCase[] = [
      {
        inputs: { test: 'value' },
        expected: 'valid',
        description: 'Test case'
      }
    ];

    const result = generateVitestCode(spec, testCases);

    expect(result).toContain("// TODO: Import the function or model to test");
    expect(result).toContain("// import { TestModel } from './path/to/TestModel';");
    expect(result).toContain("// TODO: Execute the test subject");
    expect(result).toContain("// const result = TestModel(inputs);");
    expect(result).toContain("// TODO: Check expected values");
    expect(result).toContain("// expect(result).toBeDefined();");
    expect(result).toContain("// expect(result.error).toBeUndefined();");
  });

  test('should generate proper error handling TODOs for invalid cases', () => {
    const spec: Specification = {
      type: 'model',
      name: 'TestModel',
      columns: []
    };

    const testCases: TestCase[] = [
      {
        inputs: { test: 'invalid' },
        expected: 'invalid',
        description: 'Invalid test case'
      }
    ];

    const result = generateVitestCode(spec, testCases);

    expect(result).toContain("// TODO: Verify that an error occurs");
    expect(result).toContain("// expect(() => TestModel(inputs)).toThrow();");
    expect(result).toContain("// or");
    expect(result).toContain("// const result = TestModel(inputs);");
    expect(result).toContain("// expect(result.error).toBeDefined();");
  });

  test('should handle empty test cases array', () => {
    const spec: Specification = {
      type: 'model',
      name: 'EmptyModel',
      columns: []
    };

    const testCases: TestCase[] = [];

    const result = generateVitestCode(spec, testCases);

    expect(result).toContain("describe('Tests for EmptyModel', () => {");
    expect(result).not.toContain("// Valid cases");
    expect(result).not.toContain("// Invalid cases");
    expect(result).not.toContain("test.each([");
    expect(result).toContain("});");
  });

  test('should handle quotes in description and string values', () => {
    const spec: Specification = {
      type: 'model',
      name: 'QuoteTest',
      columns: []
    };

    const testCases: TestCase[] = [
      {
        inputs: { message: "It's a test with 'quotes'" },
        expected: 'valid',
        description: "Test with 'single quotes'"
      }
    ];

    const result = generateVitestCode(spec, testCases);

    expect(result).toContain("message: \"It's a test with 'quotes'\"");
    expect(result).toContain("description: 'Test with 'single quotes''");
  });
});