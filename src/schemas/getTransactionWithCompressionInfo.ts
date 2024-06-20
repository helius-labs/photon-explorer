import { z } from "zod";

const dataSchema = z.object({
  discriminator: z.number(),
  data: z.string(),
  dataHash: z.string(),
});

const accountSchema = z.object({
  hash: z.string(),
  address: z.null(),
  data: dataSchema,
  owner: z.string(),
  lamports: z.number(),
  tree: z.string(),
  leafIndex: z.number(),
  seq: z.number(),
  slotCreated: z.number(),
});

const optionalTokenDataSchema = z.object({
  mint: z.string(),
  owner: z.string(),
  amount: z.number(),
  delegate: z.null(),
  state: z.string(),
  isNative: z.null(),
  delegatedAmount: z.number(),
});

const closedAccountSchema = z.object({
  account: accountSchema,
  optional_token_data: optionalTokenDataSchema,
});

const compressionInfoSchema = z.object({
  closed_accounts: z.array(closedAccountSchema),
  opened_accounts: z.array(closedAccountSchema),
});

const logMessageSchema = z.string();

const instructionSchema = z.object({
  programIdIndex: z.number(),
  accounts: z.array(z.number()),
  data: z.string(),
  stackHeight: z.number(),
});

const innerInstructionSchema = z.object({
  index: z.number(),
  instructions: z.array(instructionSchema),
});

const metaSchema = z.object({
  err: z.null(),
  status: z.object({
    Ok: z.null(),
  }),
  fee: z.number(),
  preBalances: z.array(z.number()),
  postBalances: z.array(z.number()),
  innerInstructions: z.array(innerInstructionSchema),
  logMessages: z.array(logMessageSchema),
  preTokenBalances: z.array(z.any()),
  postTokenBalances: z.array(z.any()),
  rewards: z.array(z.any()),
  loadedAddresses: z.object({
    writable: z.array(z.any()),
    readonly: z.array(z.any()),
  }),
  computeUnitsConsumed: z.number(),
});

const transactionSchema = z.object({
  slot: z.number(),
  transaction: z.tuple([z.string(), z.string()]),
  meta: metaSchema,
  version: z.number(),
  blockTime: z.number(),
});

const resultSchema = z.object({
  transaction: transactionSchema,
  compression_info: compressionInfoSchema,
});

export const getTransactionWithCompressionInfoSchema = z.object({
  jsonrpc: z.literal("2.0"),
  result: resultSchema,
  id: z.number(),
});
