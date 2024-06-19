import { z } from "zod";

export const getCompressedAccountSchema = z.object({
  jsonrpc: z.literal("2.0"),
  result: z.object({
    context: z.object({
      slot: z.number(),
    }),
    value: z.object({
      hash: z.string(),
      address: z.null(),
      data: z.object({
        discriminator: z.number(),
        data: z.string(),
        dataHash: z.string(),
      }),
      owner: z.string(),
      lamports: z.number(),
      tree: z.string(),
      leafIndex: z.number(),
      seq: z.number(),
      slotCreated: z.number(),
    }),
  }),
  id: z.number(),
});

export type GetCompressedAccount = z.infer<typeof getCompressedAccountSchema>;
