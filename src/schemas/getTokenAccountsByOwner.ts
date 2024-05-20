import { z } from "zod";

export const tokenAmountSchema = z.object({
  amount: z.string(),
  decimals: z.number(),
  uiAmount: z.number(),
  uiAmountString: z.string(),
});

export const infoSchema = z.object({
  tokenAmount: z.nullable(tokenAmountSchema),
  state: z.string(),
  isNative: z.boolean(),
  mint: z.string(),
  owner: z.string(),
});

export const parsedSchema = z.object({
  info: infoSchema,
  type: z.string(),
});

export const dataSchema = z.object({
  program: z.string(),
  parsed: parsedSchema,
  space: z.number(),
});

export const accountSchema = z.object({
  data: dataSchema,
  executable: z.boolean(),
  lamports: z.number(),
  owner: z.string(),
  rentEpoch: z.number(),
  space: z.number(),
});

export const valueSchema = z.object({
  account: accountSchema,
  pubkey: z.string(),
});

export type Value = z.infer<typeof valueSchema>;

export const contextSchema = z.object({
  slot: z.number(),
});

export const resultSchema = z.object({
  context: contextSchema,
  value: z.array(valueSchema),
});

export const getTokenAccountsByOwnerSchema = z.object({
  jsonrpc: z.string(),
  result: resultSchema,
  id: z.number(),
});
