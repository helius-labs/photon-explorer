import { z } from "zod";

// Define the status object schema
export const statusSchema = z.object({
  Ok: z.null(),
});

// Define the meta object schema
export const metaSchema = z.object({
  err: z.null(),
  fee: z.number(),
  innerInstructions: z.array(z.unknown()),
  logMessages: z.array(z.unknown()),
  postBalances: z.array(z.number()),
  postTokenBalances: z.array(z.unknown()),
  preBalances: z.array(z.number()),
  preTokenBalances: z.array(z.unknown()),
  rewards: z.null(),
  status: statusSchema,
});

// Define the header object schema
export const headerSchema = z.object({
  numReadonlySignedAccounts: z.number(),
  numReadonlyUnsignedAccounts: z.number(),
  numRequiredSignatures: z.number(),
});

// Define the instruction object schema
export const instructionSchema = z.object({
  accounts: z.array(z.number()),
  data: z.string(),
  programIdIndex: z.number(),
});

// Define the message object schema
export const messageSchema = z.object({
  accountKeys: z.array(z.object({ pubkey: z.string() })),
  header: headerSchema,
  instructions: z.array(instructionSchema),
  recentBlockhash: z.string(),
});

// Define the transaction object schema
export const transactionSchema = z.object({
  message: messageSchema,
  signatures: z.array(z.string()),
});

// Define the transaction item schema
export const transactionItemSchema = z.object({
  meta: metaSchema,
  transaction: transactionSchema,
});

// Define the result object schema
export const resultSchema = z.object({
  blockHeight: z.number(),
  blockTime: z.number(),
  blockhash: z.string(),
  parentSlot: z.number(),
  previousBlockhash: z.string(),
  transactions: z.array(transactionItemSchema),
});

// Define the root schema
export const getBlockSchema = z.object({
  jsonrpc: z.string(),
  result: resultSchema,
  id: z.number(),
});
