import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { GetPromptRequestSchema, ListPromptsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

export function registerPromptHandlers(server: Server) {
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
}