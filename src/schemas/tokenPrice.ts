import { z } from "zod";

export const tokenSchema = z.object({
  id: z.string(),
  mintSymbol: z.string(),
  vsToken: z.string(),
  vsTokenSymbol: z.string(),
  price: z.number(),
});

export const dataSchema = z.record(z.string(), tokenSchema);

export const tokenPriceSchema = z.object({
  data: dataSchema,
  timeTaken: z.number(),
});
