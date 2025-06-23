import { Column } from "../types";

export function generateBoundaryValues(column: Column): any[] {
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