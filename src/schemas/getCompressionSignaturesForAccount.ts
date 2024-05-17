import { z } from "zod";

export const itemSchema = z.object({
  blockTime: z.number(),
  signature: z.string(),
  slot: z.number(),
});

export const resultSchema = z.object({
  context: z.object({
    slot: z.number(),
  }),
  value: z.object({
    items: z.array(itemSchema),
  }),
});

export const getCompressionSignaturesForAccountSchema = z.object({
  jsonrpc: z.string(),
  result: resultSchema,
  id: z.number(),
});
