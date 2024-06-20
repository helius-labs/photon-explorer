import { z } from "zod";

import {
  compressionSchema,
  ownershipSchema,
  royaltySchema,
} from "./fungibleTokens";

export const attributeSchema = z.object({
  value: z.string(),
  trait_type: z.string(),
});

export const metadataSchema = z.object({
  attributes: z.array(attributeSchema),
  description: z.string(),
  name: z.string(),
  symbol: z.string(),
});

export const fileSchema = z.object({
  uri: z.string(),
  cdn_uri: z.string(),
  mime: z.string(),
});

export const nonFungibleContentSchema = z.object({
  $schema: z.string(),
  json_uri: z.string(),
  files: z.array(fileSchema),
  metadata: metadataSchema,
  links: z.record(z.string()),
});

export const authoritySchema = z.object({
  address: z.string(),
  scopes: z.array(z.string()),
});

export const collectionMetadataSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  image: z.string(),
  description: z.string(),
  external_url: z.string(),
});

export const groupingSchema = z.object({
  group_key: z.string(),
  group_value: z.string(),
  collection_metadata: collectionMetadataSchema,
});

export const creatorSchema = z.object({
  address: z.string(),
  share: z.number(),
  verified: z.boolean(),
});

export const supplySchema = z.object({
  print_max_supply: z.number(),
  print_current_supply: z.number(),
  edition_nonce: z.number(),
});

export const inscriptionSchema = z.object({
  order: z.number(),
  size: z.number(),
  contentType: z.string(),
  encoding: z.string(),
  validationHash: z.string(),
  inscriptionDataAccount: z.string(),
});

export const spl20Schema = z.object({
  p: z.string(),
  op: z.string(),
  tick: z.string(),
  amt: z.string(),
});

export const nonFungibleTokenSchema = z.object({
  interface: z.string(),
  id: z.string(),
  content: nonFungibleContentSchema,
  authorities: z.array(authoritySchema),
  compression: compressionSchema,
  grouping: z.array(groupingSchema),
  royalty: royaltySchema,
  creators: z.array(creatorSchema),
  ownership: ownershipSchema,
  supply: supplySchema.nullable(),
  mutable: z.boolean(),
  burnt: z.boolean(),
  inscription: inscriptionSchema,
  spl20: spl20Schema,
});

export const nonFungibleApiResponseSchema = z.object({
  items: z.array(nonFungibleTokenSchema),
});

export type NonFungibleApiResponse = z.infer<
  typeof nonFungibleApiResponseSchema
>;
export type NonFungibleToken = z.infer<typeof nonFungibleTokenSchema>;
export type NonFungibleContent = z.infer<typeof nonFungibleContentSchema>;
export type Authority = z.infer<typeof authoritySchema>;
export type CollectionMetadata = z.infer<typeof collectionMetadataSchema>;
export type Grouping = z.infer<typeof groupingSchema>;
export type Creator = z.infer<typeof creatorSchema>;
export type Supply = z.infer<typeof supplySchema>;
export type Inscription = z.infer<typeof inscriptionSchema>;
export type Spl20 = z.infer<typeof spl20Schema>;
export type Attribute = z.infer<typeof attributeSchema>;
export type Metadata = z.infer<typeof metadataSchema>;
export type File = z.infer<typeof fileSchema>;
