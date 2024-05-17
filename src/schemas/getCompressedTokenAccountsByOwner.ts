import { z } from "zod";

export const itemSchema = z.object({
  account: z.object({
    address: z.string(),
    data: z.object({
      data: z.string(),
      dataHash: z.string(),
      discriminator: z.number(),
    }),
    hash: z.string(),
    lamports: z.number(),
    leafIndex: z.number(),
    owner: z.string(),
    seq: z.number(),
    slotCreated: z.number(),
    tree: z.string(),
  }),
  tokenData: z.object({
    amount: z.number(),
    delegate: z.string(),
    delegatedAmount: z.number(),
    isNative: z.number(),
    mint: z.string(),
    owner: z.string(),
    state: z.string(),
  }),
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

export const getCompressedTokenAccountsByOwnerSchema = z.object({
  jsonrpc: z.string(),
  result: resultSchema,
  id: z.number(),
});
