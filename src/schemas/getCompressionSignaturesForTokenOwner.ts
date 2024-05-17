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
    cursor: z.nullable(z.string()),
    items: z.array(itemSchema),
  }),
});

export const getCompressionSignaturesForTokenOwnerSchema = z.object({
  jsonrpc: z.string(),
  result: resultSchema,
  id: z.number(),
});
