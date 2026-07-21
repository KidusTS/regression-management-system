import { z } from "zod";

export const packSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  project: z.string().optional(),
});

export type PackFormValues = z.infer<typeof packSchema>;
