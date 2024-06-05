import { z } from "zod";

// Define the extensions schema
export const ExtensionsSchema = z.object({
  coingeckoId: z.string().optional(),
});

// Define the main schema for the objects in the array
export const TokenSchema = z.object({
  address: z.string(),
  chainId: z.number(),
  decimals: z.number(),
  name: z.string(),
  symbol: z.string(),
  logoURI: z.string().optional(),
  tags: z.array(z.string()),
  extensions: ExtensionsSchema.optional(),
});

// Define the schema for the array of tokens
export const tokenListSchema = z.array(TokenSchema);
