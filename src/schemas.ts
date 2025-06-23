import { z } from "zod";

export const GenerateTestCodeSchema = z.object({
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