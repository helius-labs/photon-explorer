import { z } from "zod";

const authoritySchema = z.object({
  address: z.string(),
  scopes: z.array(z.string()),
});

const compressionSchema = z.object({
  eligible: z.boolean(),
  compressed: z.boolean(),
  data_hash: z.string().optional(),
  creator_hash: z.string().optional(),
  asset_hash: z.string().optional(),
  tree: z.string().optional(),
  seq: z.number().optional(),
  leaf_id: z.number().optional(),
});

const groupingSchema = z.object({
  group_key: z.string(),
  group_value: z.string(),
});

const royaltySchema = z.object({
  royalty_model: z.string(),
  target: z.string().nullable(),
  percent: z.number(),
  basis_points: z.number(),
  primary_sale_happened: z.boolean(),
  locked: z.boolean(),
});

const creatorSchema = z.object({
  address: z.string(),
  share: z.number(),
  verified: z.boolean(),
});

const ownershipSchema = z.object({
  frozen: z.boolean(),
  delegated: z.boolean(),
  delegate: z.string().nullable(),
  ownership_model: z.string(),
  owner: z.string(),
});

const supplySchema = z.object({
  print_max_supply: z.number(),
  print_current_supply: z.number(),
  edition_nonce: z.number().nullable(),
});

const tokenInfoSchema = z
  .object({
    supply: z.number(),
    decimals: z.number(),
    token_program: z.string(),
    associated_token_address: z.string(),
  })
  .optional();

const contentMetadataAttributesSchema = z.object({
  value: z.union([z.string(), z.number(), z.boolean()]),
  trait_type: z.string(),
});

const contentMetadataSchema = z.object({
  description: z.string().optional(),
  name: z.string(),
  symbol: z.string(),
  token_standard: z.string().optional(),
  attributes: z.array(contentMetadataAttributesSchema).optional(),
});

const contentLinksSchema = z.object({
  image: z.string().optional(),
  external_url: z.string().optional(),
  animation_url: z.string().optional(),
});

const contentFilesSchema = z.object({
  uri: z.string(),
  cdn_uri: z.string().optional(),
  mime: z.string(),
});

const contentSchema = z.object({
  $schema: z.string(),
  json_uri: z.string(),
  files: z.array(contentFilesSchema),
  metadata: contentMetadataSchema,
  links: contentLinksSchema,
});

const itemSchema = z.object({
  interface: z.string(),
  id: z.string(),
  content: contentSchema,
  authorities: z.array(authoritySchema),
  compression: compressionSchema,
  grouping: z.array(groupingSchema),
  royalty: royaltySchema,
  creators: z.array(creatorSchema),
  ownership: ownershipSchema,
  supply: supplySchema,
  mutable: z.boolean(),
  burnt: z.boolean(),
  token_info: tokenInfoSchema,
});

const resultSchema = z.object({
  total: z.number(),
  limit: z.number(),
  page: z.number(),
  items: z.array(itemSchema),
});

export const getAssetsByOwnerSchema = z.object({
  jsonrpc: z.string(),
  result: resultSchema,
  id: z.string(),
});
