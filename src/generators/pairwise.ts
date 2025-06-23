import { Column, TestCase } from "../types";
import { isValidValue } from "../utils/validation";
import { cartesianProduct } from "../utils/cartesian";

export function generatePairwiseCombinations(columnsWithValues: Array<{ column: Column; values: any[] }>): TestCase[] {
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