import { z } from "zod";

export const resultSchema = z.object({
  err: z.nullable(
    z.object({
      InstructionError: z.tuple([
        z.number(),
        z.union([
          z.string(),
          z.object({
            Custom: z.number(),
          }),
        ]),
      ]),
    }),
  ),
  memo: z.nullable(z.string()),
  signature: z.string(),
  slot: z.number(),
  blockTime: z.nullable(z.number()),
});

export type Result = z.infer<typeof resultSchema>;

export const getSignaturesForAddressSchema = z.object({
  jsonrpc: z.string(),
  result: z.array(resultSchema),
  id: z.number(),
});
