import { z } from "zod";

export const createSessionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  packVersionId: z.string().min(1, "Pack version is required"),
  softwareVersion: z.string().optional(),
  environment: z.string().optional(),
});

export type CreateSessionFormValues = z.infer<typeof createSessionSchema>;
