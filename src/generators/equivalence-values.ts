import { Column } from "../types";

export function generateEquivalenceValues(column: Column): any[] {
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