import { z } from "zod";

export const itemSchema = z.object({
  address: z.nullable(z.string()),
  data: z.nullable(
    z.object({
      data: z.string(),
      dataHash: z.string(),
      discriminator: z.number(),
    }),
  ),
  hash: z.string(),
  lamports: z.number(),
  leafIndex: z.number(),
  owner: z.string(),
  seq: z.number(),
  slotCreated: z.number(),
  tree: z.string(),
});

export type Item = z.infer<typeof itemSchema>;

export const resultSchema = z.object({
  context: z.object({
    slot: z.number(),
  }),
  value: z.object({
    cursor: z.nullable(z.string()),
    items: z.array(itemSchema),
  }),
});

export const getCompressedAccountsByOwnerSchema = z.object({
  jsonrpc: z.string(),
  result: resultSchema,
  id: z.number(),
});
