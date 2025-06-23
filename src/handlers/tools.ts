import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { GenerateTestCodeSchema } from "../schemas";
import { Specification } from "../types";
import { generateBoundaryValues } from "../generators/boundary-values";
import { generateEquivalenceValues } from "../generators/equivalence-values";
import { generatePairwiseCombinations } from "../generators/pairwise";
import { generateVitestCode } from "../generators/vitest-code";

export function registerToolHandlers(server: Server) {
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
}