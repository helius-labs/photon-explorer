import { z } from "zod";

export const priceInfoSchema = z.object({
  price_per_token: z.number().optional(),
  total_price: z.number().optional(),
  currency: z.string().optional(),
});

export const tokenInfoSchema = z.object({
  symbol: z.string().optional(),
  balance: z.number().optional(),
  supply: z.number().optional(),
  decimals: z.number().optional(),
  token_program: z.string().optional(),
  associated_token_address: z.string().optional(),
  price_info: priceInfoSchema.optional(),
});

export const mintExtensionsSchema = z
  .object({
    confidential_transfer_mint: z
      .object({
        authority: z.string(),
        auto_approve_new_accounts: z.boolean(),
        auditor_elgamal_pubkey: z.string(),
      })
      .optional(),
    confidential_transfer_fee_config: z
      .object({
        authority: z.string(),
        withdraw_withheld_authority_elgamal_pubkey: z.string(),
        harvest_to_mint_enabled: z.boolean(),
        withheld_amount: z.string(),
      })
      .optional(),
    transfer_fee_config: z
      .object({
        transfer_fee_config_authority: z.string(),
        withdraw_withheld_authority: z.string(),
        withheld_amount: z.number(),
        older_transfer_fee: z
          .object({
            epoch: z.string(),
            maximum_fee: z.string(),
            transfer_fee_basis_points: z.string(),
          })
          .optional(),
        newer_transfer_fee: z
          .object({
            epoch: z.string(),
          })
          .optional(),
      })
      .optional(),
    metadata_pointer: z
      .object({
        authority: z.string(),
        metadata_address: z.string(),
      })
      .optional(),
    mint_close_authority: z
      .object({
        close_authority: z.string(),
      })
      .optional(),
    permanent_delegate: z
      .object({
        delegate: z.string(),
      })
      .optional(),
    transfer_hook: z
      .object({
        authority: z.string(),
        program_id: z.string(),
      })
      .optional(),
    interest_bearing_config: z
      .object({
        rate_authority: z.string(),
        initialization_timestamp: z.number(),
        pre_update_average_rate: z.number(),
        last_update_timestamp: z.number(),
        current_rate: z.number(),
      })
      .optional(),
    default_account_state: z
      .object({
        state: z.string(),
      })
      .optional(),
    confidential_transfer_account: z
      .object({
        approved: z.boolean(),
        elgamal_pubkey: z.string(),
        pending_balance_lo: z.string(),
        pending_balance_hi: z.string(),
        available_balance: z.string(),
        decryptable_available_balance: z.string(),
        allow_confidential_credits: z.boolean(),
        allow_non_confidential_credits: z.boolean(),
        pending_balance_credit_counter: z.number(),
        maximum_pending_balance_credit_counter: z.number(),
        expected_pending_balance_credit_counter: z.number(),
        actual_pending_balance_credit_counter: z.number(),
      })
      .optional(),
    metadata: z
      .object({
        update_authority: z.string(),
        mint: z.string(),
        name: z.string(),
        symbol: z.string(),
        uri: z.string(),
        additional_metadata: z
          .array(
            z.object({
              key: z.string(),
              value: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
  })
  .partial(); // Make all properties optional

export const compressionSchema = z.object({
  eligible: z.boolean(),
  compressed: z.boolean(),
  data_hash: z.string(),
  creator_hash: z.string(),
  asset_hash: z.string(),
  tree: z.string(),
  seq: z.number(),
  leaf_id: z.number(),
});

export const royaltySchema = z.object({
  royalty_model: z.string(),
  target: z.string().nullable(),
  percent: z.number(),
  basis_points: z.number(),
  primary_sale_happened: z.boolean(),
  locked: z.boolean(),
});

export const ownershipSchema = z.object({
  frozen: z.boolean(),
  delegated: z.boolean(),
  delegate: z.string().nullable(),
  ownership_model: z.string(),
  owner: z.string(),
});

export const contentSchema = z.object({
  $schema: z.string(),
  json_uri: z.string(),
  files: z.array(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  links: z.record(z.any()).optional(),
});

export const fungibleTokenSchema = z.object({
  interface: z.string(),
  id: z.string(),
  content: contentSchema.optional(),
  authorities: z.array(z.any()).optional(),
  compression: z
    .object({
      eligible: z.boolean(),
      compressed: z.boolean(),
      data_hash: z.string(),
      creator_hash: z.string(),
      asset_hash: z.string(),
      tree: z.string(),
      seq: z.number(),
      leaf_id: z.number(),
    })
    .optional(),
  grouping: z.array(z.any()).optional(),
  royalty: z
    .object({
      royalty_model: z.string(),
      target: z.string().nullable(),
      percent: z.number(),
      basis_points: z.number(),
      primary_sale_happened: z.boolean(),
      locked: z.boolean(),
    })
    .optional(),
  creators: z.array(z.any()).optional(),
  ownership: z
    .object({
      frozen: z.boolean(),
      delegated: z.boolean(),
      delegate: z.string().nullable(),
      ownership_model: z.string(),
      owner: z.string(),
    })
    .optional(),
  supply: z.number().nullable(),
  mutable: z.boolean(),
  burnt: z.boolean(),
  mint_extensions: mintExtensionsSchema.optional(),
  token_info: z
    .object({
      symbol: z.string(),
      balance: z.number(),
      supply: z.number(),
      decimals: z.number(),
      token_program: z.string(),
      associated_token_address: z.string(),
      price_info: z
        .object({
          price_per_token: z.number(),
          total_price: z.number(),
          currency: z.string(),
        })
        .optional(),
    })
    .optional(),
});

export const apiResponseSchema = z.object({
  total: z.number(),
  limit: z.number(),
  cursor: z.string(),
  items: z.array(fungibleTokenSchema),
});

export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type FungibleToken = z.infer<typeof fungibleTokenSchema>;
export type TokenInfo = z.infer<typeof tokenInfoSchema>;
export type Content = z.infer<typeof contentSchema>;
export type Compression = z.infer<typeof compressionSchema>;
export type Royalty = z.infer<typeof royaltySchema>;
export type Ownership = z.infer<typeof ownershipSchema>;
export type MintExtensions = z.infer<typeof mintExtensionsSchema>;
export type PriceInfo = z.infer<typeof priceInfoSchema>;
