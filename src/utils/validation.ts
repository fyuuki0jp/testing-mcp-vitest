import { Column } from "../types";

export function isValidValue(column: Column, value: any): boolean {
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