import { Specification, TestCase } from "../types";

export function generateVitestCode(spec: Specification, testCases: TestCase[]): string {
  const normalCases = testCases.filter(tc => tc.expected === "valid");
  const errorCases = testCases.filter(tc => tc.expected === "invalid");
  
  let code = `import { describe, test, expect } from 'vitest';\n\n`;
  code += `describe('Tests for ${spec.name}', () => {\n`;
  
  // Valid cases tests
  if (normalCases.length > 0) {
    code += `  // Valid cases\n`;
    code += `  test.each([\n`;
    
    normalCases.forEach(tc => {
      const inputsStr = Object.entries(tc.inputs)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(', ');
      code += `    { inputs: { ${inputsStr} }, description: '${tc.description}' },\n`;
    });
    
    code += `  ])('Valid case: $description', ({ inputs }) => {\n`;
    code += `    // TODO: Import the function or model to test\n`;
    code += `    // import { ${spec.name} } from './path/to/${spec.name}';\n\n`;
    code += `    // TODO: Execute the test subject\n`;
    code += `    // const result = ${spec.name}(inputs);\n\n`;
    code += `    // TODO: Check expected values\n`;
    code += `    // expect(result).toBeDefined();\n`;
    code += `    // expect(result.error).toBeUndefined();\n`;
    code += `  });\n\n`;
  }
  
  // Invalid cases tests
  if (errorCases.length > 0) {
    code += `  // Invalid cases\n`;
    code += `  test.each([\n`;
    
    errorCases.forEach(tc => {
      const inputsStr = Object.entries(tc.inputs)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(', ');
      code += `    { inputs: { ${inputsStr} }, description: '${tc.description}' },\n`;
    });
    
    code += `  ])('Invalid case: $description', ({ inputs }) => {\n`;
    code += `    // TODO: Import the function or model to test\n`;
    code += `    // import { ${spec.name} } from './path/to/${spec.name}';\n\n`;
    code += `    // TODO: Verify that an error occurs\n`;
    code += `    // expect(() => ${spec.name}(inputs)).toThrow();\n`;
    code += `    // or\n`;
    code += `    // const result = ${spec.name}(inputs);\n`;
    code += `    // expect(result.error).toBeDefined();\n`;
    code += `  });\n`;
  }
  
  code += `});\n`;
  
  return code;
}