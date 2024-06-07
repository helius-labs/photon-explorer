import { z } from "zod";

export const InstructionSchema = z.object({
  accounts: z.optional(z.array(z.string())),
  data: z.string().optional(),
  programId: z.string(),
  stackHeight: z.number().nullable(),
  parsed: z
    .object({
      info: z.object({
        destination: z.string().optional(),
        lamports: z.number().optional(),
        source: z.string().optional(),
        account: z.string().optional(),
        space: z.number().optional(),
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

export const uiTokenAmountSchema = z.object({
  amount: z.string(),
  decimals: z.number(),
  uiAmount: z.number().nullable(),
  uiAmountString: z.string(),
});

export const postTokenBalanceSchema = z.object({
  accountIndex: z.number(),
  mint: z.string(),
  owner: z.string(),
  uiTokenAmount: uiTokenAmountSchema,
});

export const postTokenBalancesSchema = z.array(postTokenBalanceSchema);

const preTokenBalanceSchema = z.object({
  accountIndex: z.number(),
  mint: z.string(),
  owner: z.string(),
  uiTokenAmount: uiTokenAmountSchema,
});

const preTokenBalancesSchema = z.array(preTokenBalanceSchema);

export const MetaSchema = z.object({
  computeUnitsConsumed: z.number().optional(),
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
  fee: z.number(),
  innerInstructions: z.array(InnerInstructionSchema),
  logMessages: z.array(z.string()),
  postBalances: z.array(z.number()),
  postTokenBalances: postTokenBalancesSchema,
  preBalances: z.array(z.number()),
  preTokenBalances: preTokenBalancesSchema,
  rewards: z.array(z.unknown()),
  status: z.object({
    Ok: z.null().optional(),
    Err: z
      .nullable(
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
      )
      .optional(),
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
    addressTableLookups: z.array(z.unknown()).optional(),
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
  version: z.union([z.string(), z.number()]),
});

export type Result = z.infer<typeof ResultSchema>;

export const getTransactionSchema = z.object({
  jsonrpc: z.string(),
  result: ResultSchema,
  id: z.number(),
});
