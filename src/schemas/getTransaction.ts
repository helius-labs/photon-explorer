import { z } from "zod";

export const InstructionSchema = z.object({
  accounts: z.optional(z.array(z.string())),
  data: z.string().optional(),
  programId: z.string(),
  stackHeight: z.number().nullable(),
  parsed: z
    .object({
      info: z.object({
        destination: z.string(),
        lamports: z.number(),
        source: z.string(),
      }),
      type: z.string(),
    })
    .optional(),
  program: z.string().optional(),
});

export const InnerInstructionSchema = z.object({
  index: z.number(),
  instructions: z.array(InstructionSchema),
});

export const MetaSchema = z.object({
  computeUnitsConsumed: z.number(),
  err: z.null(),
  fee: z.number(),
  innerInstructions: z.array(InnerInstructionSchema),
  logMessages: z.array(z.string()),
  postBalances: z.array(z.number()),
  postTokenBalances: z.array(z.unknown()),
  preBalances: z.array(z.number()),
  preTokenBalances: z.array(z.unknown()),
  rewards: z.array(z.unknown()),
  status: z.object({
    Ok: z.null(),
  }),
});

export const AccountKeySchema = z.object({
  pubkey: z.string(),
  signer: z.boolean(),
  source: z.string(),
  writable: z.boolean(),
});

export const TransactionSchema = z.object({
  message: z.object({
    accountKeys: z.array(AccountKeySchema),
    addressTableLookups: z.array(z.unknown()),
    instructions: z.array(InstructionSchema),
    recentBlockhash: z.string(),
  }),
  signatures: z.array(z.string()),
});

export const ResultSchema = z.object({
  blockTime: z.number(),
  meta: MetaSchema,
  slot: z.number(),
  transaction: TransactionSchema,
  version: z.number(),
});

export type Result = z.infer<typeof ResultSchema>;

export const getTransactionSchema = z.object({
  jsonrpc: z.string(),
  result: ResultSchema,
  id: z.number(),
});
