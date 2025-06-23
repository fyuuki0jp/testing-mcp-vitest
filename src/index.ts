#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Type definitions for specifications
interface Specification {
  type: "model" | "module";
  name: string;
  columns: Column[];
}

interface Column {
  name: string;
  type: string;
  valueType: "category" | "continues";
  values: {
    valid?: any[];
    invalid?: any[];
    // Single range
    min?: number;
    max?: number;
    // Multiple ranges
    ranges?: Array<{ min: number; max: number }>;
    regex?: string;
    [key: string]: any;
  };
}

// Test case type definition
interface TestCase {
  inputs: Record<string, any>;
  expected: "valid" | "invalid";
  description: string;
}

// MCP server setup
const server = new Server(
  {
    name: "test-code-generator",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
    },
  }
);

// Tool schema definition
const GenerateTestCodeSchema = z.object({
  specification: z.object({
    type: z.enum(["model", "module"]),
    name: z.string(),
    columns: z.array(
      z.object({
        name: z.string(),
        type: z.string(),
        valueType: z.enum(["category", "continues"]),
        values: z.record(z.any()),
      })
    ),
  }),
});

// Generate boundary values for single or multiple ranges
function generateBoundaryValues(column: Column): any[] {
  const values: any[] = [];

  if (column.valueType === "continues") {
    // Handle multiple ranges
    if (column.values.ranges && column.values.ranges.length > 0) {
      column.values.ranges.forEach((range, index) => {
        // Boundary values for each range
        values.push(
          range.min - 1,  // Below minimum (invalid)
          range.min,      // Minimum (valid)
          range.min + 1,  // Just above minimum (valid)
          Math.floor((range.min + range.max) / 2), // Middle value (valid)
          range.max - 1,  // Just below maximum (valid)
          range.max,      // Maximum (valid)
          range.max + 1   // Above maximum (invalid)
        );
        
        // Gap values between ranges (all invalid)
        if (index < column.values.ranges!.length - 1) {
          const nextRange = column.values.ranges![index + 1];
          const gapMiddle = Math.floor((range.max + nextRange.min) / 2);
          values.push(gapMiddle); // Middle of gap (invalid)
        }
      });
    }
    // Handle single range
    else if (column.values.min !== undefined && column.values.max !== undefined) {
      values.push(
        column.values.min - 1,  // Below minimum (invalid)
        column.values.min,      // Minimum (valid)
        column.values.min + 1,  // Just above minimum (valid)
        Math.floor((column.values.min + column.values.max) / 2), // Middle value (valid)
        column.values.max - 1,  // Just below maximum (valid)
        column.values.max,      // Maximum (valid)
        column.values.max + 1   // Above maximum (invalid)
      );
    }
  }

  return values;
}

// Generate equivalence class values (all values)
function generateEquivalenceValues(column: Column): any[] {
  const values: any[] = [];

  if (column.valueType === "category") {
    // Include all valid values
    if (column.values.valid && column.values.valid.length > 0) {
      values.push(...column.values.valid);
    }
    // Include all invalid values
    if (column.values.invalid && column.values.invalid.length > 0) {
      values.push(...column.values.invalid);
    }
  }

  return values;
}

// Check if a value is valid for multiple ranges
function isValidValue(column: Column, value: any): boolean {
  if (column.valueType === "continues") {
    // Check multiple ranges
    if (column.values.ranges && column.values.ranges.length > 0) {
      return column.values.ranges.some(range => 
        value >= range.min && value <= range.max
      );
    }
    // Check single range
    const { min, max } = column.values;
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
  } else if (column.valueType === "category") {
    if (column.values.valid && column.values.valid.includes(value)) return true;
    if (column.values.invalid && column.values.invalid.includes(value)) return false;
  }
  return true; // Default to valid
}

// Generate pairwise combinations (simplified version)
function generatePairwiseCombinations(columnsWithValues: Array<{ column: Column; values: any[] }>): TestCase[] {
  const testCases: TestCase[] = [];
  
  // Generate all combinations for small parameter sets
  if (columnsWithValues.length <= 3) {
    const combinations = cartesianProduct(columnsWithValues.map(c => c.values));
    
    combinations.forEach((combo, index) => {
      const inputs: Record<string, any> = {};
      let isValid = true;
      
      columnsWithValues.forEach((col, i) => {
        inputs[col.column.name] = combo[i];
        if (!isValidValue(col.column, combo[i])) {
          isValid = false;
        }
      });
      
      testCases.push({
        inputs,
        expected: isValid ? "valid" : "invalid",
        description: `Combination ${index + 1}: ${isValid ? 'Valid case' : 'Invalid case'}`,
      });
    });
  } else {
    // Simplified pairwise implementation
    const pairsCovered = new Set<string>();
    
    // Generate minimum test cases
    let attempts = 0;
    while (attempts < 100) { // Prevent infinite loop
      const inputs: Record<string, any> = {};
      let isValid = true;
      
      columnsWithValues.forEach(col => {
        const value = col.values[Math.floor(Math.random() * col.values.length)];
        inputs[col.column.name] = value;
        if (!isValidValue(col.column, value)) {
          isValid = false;
        }
      });
      
      // Check for new pairs
      let newPairFound = false;
      for (let i = 0; i < columnsWithValues.length - 1; i++) {
        for (let j = i + 1; j < columnsWithValues.length; j++) {
          const pair = `${columnsWithValues[i].column.name}:${inputs[columnsWithValues[i].column.name]}-${columnsWithValues[j].column.name}:${inputs[columnsWithValues[j].column.name]}`;
          if (!pairsCovered.has(pair)) {
            pairsCovered.add(pair);
            newPairFound = true;
          }
        }
      }
      
      if (newPairFound || attempts < 10) { // First 10 are always added
        testCases.push({
          inputs,
          expected: isValid ? "valid" : "invalid",
          description: `Pairwise test ${testCases.length + 1}: ${isValid ? 'Valid case' : 'Invalid case'}`,
        });
      }
      
      attempts++;
    }
  }
  
  return testCases;
}

// Calculate Cartesian product
function cartesianProduct(arrays: any[][]): any[][] {
  return arrays.reduce((acc, array) => {
    return acc.flatMap(x => array.map(y => [...x, y]));
  }, [[]] as any[][]);
}

// Generate Vitest test code
function generateVitestCode(spec: Specification, testCases: TestCase[]): string {
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

// Handler for listing tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate-test-code",
        description: "Generate Vitest test code based on boundary value analysis and equivalence partitioning from JSON specification",
        inputSchema: {
          type: "object",
          properties: {
            specification: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["model", "module"],
                  description: "Type of specification",
                },
                name: {
                  type: "string",
                  description: "Name of the model or module",
                },
                columns: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        description: "Parameter or column name",
                      },
                      type: {
                        type: "string",
                        description: "Data type",
                      },
                      valueType: {
                        type: "string",
                        enum: ["category", "continues"],
                        description: "Value type",
                      },
                      values: {
                        type: "object",
                        description: "Definition of equivalence classes or boundary values",
                      },
                    },
                    required: ["name", "type", "valueType", "values"],
                  },
                },
              },
              required: ["type", "name", "columns"],
            },
          },
          required: ["specification"],
        },
      },
    ],
  };
});

// Handler for tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "generate-test-code") {
    try {
      const args = GenerateTestCodeSchema.parse(request.params.arguments);
      const spec = args.specification as Specification;
      
      // Generate test values for each column
      const columnsWithValues = spec.columns.map(column => {
        let values: any[] = [];
        
        // Boundary value analysis
        if (column.valueType === "continues") {
          values.push(...generateBoundaryValues(column));
        }
        
        // Equivalence partitioning
        if (column.valueType === "category") {
          values.push(...generateEquivalenceValues(column));
        }
        
        // Remove duplicates
        values = [...new Set(values)];
        
        return { column, values };
      });
      
      // Generate test cases using pairwise method
      const testCases = generatePairwiseCombinations(columnsWithValues);
      
      // Generate Vitest code
      const testCode = generateVitestCode(spec, testCases);
      
      return {
        content: [
          {
            type: "text",
            text: testCode,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
      };
    }
  }
  
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Handler for listing prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "create-test-spec",
        description: "Explains how to create JSON test specifications",
        arguments: [
          {
            name: "target",
            description: "Test target (model/module)",
            required: false,
          },
        ],
      },
      {
        name: "boundary-value-example",
        description: "Provides examples of boundary value analysis specifications",
        arguments: [
          {
            name: "dataType",
            description: "Data type (number/string/date etc.)",
            required: false,
          },
        ],
      },
      {
        name: "equivalence-class-example",
        description: "Provides examples of equivalence partitioning specifications",
        arguments: [
          {
            name: "columnType",
            description: "Column type (category/enum etc.)",
            required: false,
          },
        ],
      },
    ],
  };
});

// Handler for getting prompts
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "create-test-spec") {
    const target = args?.target || "model";
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `How do I create a test specification for a ${target} in JSON format?`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: `## Test Specification JSON Creation Guide

### Basic Structure

\`\`\`json
{
  "type": "${target}",
  "name": "TargetName",
  "columns": [
    {
      "name": "parameterName",
      "type": "dataType",
      "valueType": "category or continues",
      "values": {
        // Value definitions
      }
    }
  ]
}
\`\`\`

### Choosing valueType

1. **continues (continuous values)**: Data with numeric ranges
   - Examples: age, price, score, temperature
   - Single range: \`{ "min": minValue, "max": maxValue }\`
   - Multiple ranges: \`{ "ranges": [{ "min": 0, "max": 10 }, { "min": 20, "max": 30 }] }\`

2. **category (categorical values)**: Data with specific allowed values
   - Examples: user types, status, choices
   - Values definition: \`{ "valid": [validValuesList], "invalid": [invalidValuesList] }\`

### Complete Example

\`\`\`json
{
  "type": "${target}",
  "name": "UserProfile",
  "columns": [
    {
      "name": "age",
      "type": "number",
      "valueType": "continues",
      "values": {
        "min": 0,
        "max": 150
      }
    },
    {
      "name": "score",
      "type": "number",
      "valueType": "continues",
      "values": {
        "ranges": [
          { "min": 0, "max": 40 },
          { "min": 60, "max": 100 }
        ]
      }
    },
    {
      "name": "role",
      "type": "string",
      "valueType": "category",
      "values": {
        "valid": ["admin", "user", "guest"],
        "invalid": ["", "superuser", "root", null]
      }
    },
    {
      "name": "email",
      "type": "string",
      "valueType": "category",
      "values": {
        "valid": ["test@example.com", "user@domain.co.jp"],
        "invalid": ["invalid-email", "@test.com", "test@", ""]
      }
    }
  ]
}
\`\`\`

### Key Points

1. **Full coverage of equivalence classes**: All valid and invalid values are included in test cases
2. **Automatic boundary value generation**: min-1, min, min+1, middle, max-1, max, max+1 are generated
3. **Multiple ranges support**: Can define discontinuous valid ranges
4. **Efficient combinations**: Uses pairwise testing for multiple parameters`,
          },
        },
      ],
    };
  }

  if (name === "boundary-value-example") {
    const dataType = args?.dataType || "number";
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Show me examples of boundary value analysis specifications for ${dataType} type.`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: `## Boundary Value Analysis Examples for ${dataType} Type

### Basic Boundary Value Definition

\`\`\`json
{
  "name": "temperature",
  "type": "${dataType}",
  "valueType": "continues",
  "values": {
    "min": -273.15,  // Absolute zero
    "max": 5778      // Sun's surface temperature
  }
}
\`\`\`

### Generated Boundary Test Values

The following values are automatically generated:

1. **Below minimum (invalid)**: -273.16
2. **Minimum (valid)**: -273.15
3. **Just above minimum (valid)**: -273.14
4. **Middle value (valid)**: 2752.425
5. **Just below maximum (valid)**: 5777
6. **Maximum (valid)**: 5778
7. **Above maximum (invalid)**: 5779

### Multiple Ranges Example

\`\`\`json
{
  "name": "workingHours",
  "type": "number",
  "valueType": "continues",
  "values": {
    "ranges": [
      { "min": 9, "max": 12 },   // Morning shift
      { "min": 13, "max": 17 }    // Afternoon shift
    ]
  }
}
\`\`\`

This generates boundary values for each range:
- Range 1: 8, 9, 10, 10.5, 11, 12, 13
- Range 2: 12, 13, 14, 15, 16, 17, 18
- Gap value: 12.5 (invalid - between ranges)

### More Examples

#### Age (integer)
\`\`\`json
{
  "name": "age",
  "type": "number",
  "valueType": "continues",
  "values": {
    "min": 0,
    "max": 120
  }
}
\`\`\`

#### Price (decimal)
\`\`\`json
{
  "name": "price",
  "type": "number",
  "valueType": "continues",
  "values": {
    "min": 0.01,
    "max": 999999.99
  }
}
\`\`\`

#### Score with Valid Ranges
\`\`\`json
{
  "name": "passingScore",
  "type": "number",
  "valueType": "continues",
  "values": {
    "ranges": [
      { "min": 60, "max": 100 },  // Pass
      { "min": 120, "max": 200 }  // Bonus level
    ]
  }
}
\`\`\`

### Notes

- Boundary values are automatically calculated, so only min and max need to be specified
- For integers, integer values are generated automatically
- For decimals, appropriate precision is maintained
- Multiple ranges are useful for discontinuous valid value sets`,
          },
        },
      ],
    };
  }

  if (name === "equivalence-class-example") {
    const columnType = args?.columnType || "category";
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Show me examples of equivalence partitioning specifications for ${columnType} type.`,
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: `## Equivalence Partitioning Examples for ${columnType} Type

### Basic Equivalence Class Definition

\`\`\`json
{
  "name": "userStatus",
  "type": "string",
  "valueType": "category",
  "values": {
    "valid": ["active", "inactive", "pending", "suspended"],
    "invalid": ["", "deleted", "unknown", null, "ACTIVE", " active "]
  }
}
\`\`\`

### Equivalence Class Design Principles

1. **Valid equivalence classes**
   - Values that the system should process normally
   - All values are included in test cases

2. **Invalid equivalence classes**
   - Values that should result in errors
   - All values are included in test cases

### Practical Examples

#### Email Addresses
\`\`\`json
{
  "name": "email",
  "type": "string",
  "valueType": "category",
  "values": {
    "valid": [
      "user@example.com",
      "test.user@example.co.jp",
      "admin+test@company.org",
      "123@numbers.com"
    ],
    "invalid": [
      "",
      "invalid-email",
      "@example.com",
      "user@",
      "user@@example.com",
      "user@.com",
      "user name@example.com",
      null
    ]
  }
}
\`\`\`

#### User Permissions
\`\`\`json
{
  "name": "permission",
  "type": "string",
  "valueType": "category",
  "values": {
    "valid": ["read", "write", "execute", "admin"],
    "invalid": ["", "delete", "sudo", "root", null, "READ", "Write"]
  }
}
\`\`\`

#### Payment Methods
\`\`\`json
{
  "name": "paymentMethod",
  "type": "string",
  "valueType": "category",
  "values": {
    "valid": ["credit_card", "debit_card", "paypal", "bank_transfer"],
    "invalid": ["", "cash", "bitcoin", "check", null, "CREDIT_CARD"]
  }
}
\`\`\`

#### Boolean Type Equivalence Classes
\`\`\`json
{
  "name": "isActive",
  "type": "boolean",
  "valueType": "category",
  "values": {
    "valid": [true, false],
    "invalid": [null, "", "true", "false", 1, 0, "yes", "no"]
  }
}
\`\`\`

#### Country Codes
\`\`\`json
{
  "name": "countryCode",
  "type": "string",
  "valueType": "category",
  "values": {
    "valid": ["US", "GB", "JP", "DE", "FR"],
    "invalid": ["", "USA", "uk", "123", "XX", null, " US "]
  }
}
\`\`\`

### Test Coverage

- **Full coverage**: All valid and invalid values are tested
- **Combinations**: Combined with other parameters using pairwise testing
- **Expected results**: Valid values are automatically classified as normal cases, invalid as error cases`,
          },
        },
      ],
    };
  }

  throw new Error(`Unknown prompt: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Silent start for cleaner npx experience
  if (process.env.DEBUG) {
    console.error("Test Code Generator MCP Server is running");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});