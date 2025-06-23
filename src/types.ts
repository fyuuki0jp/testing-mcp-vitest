export interface Specification {
  type: "model" | "module";
  name: string;
  columns: Column[];
}

export interface Column {
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

export interface TestCase {
  inputs: Record<string, any>;
  expected: "valid" | "invalid";
  description: string;
}