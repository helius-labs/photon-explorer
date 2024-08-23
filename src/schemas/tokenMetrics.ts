import { z } from "zod";

// Define the schema
export const tokenMetricsSchema = z.object({
  success: z.boolean(),
  data: z.object({
    marketCap: z.number(),
    dailyVolume: z.number(),
    createdAt: z.number(),
    holders: z.number(),
  }),
});
