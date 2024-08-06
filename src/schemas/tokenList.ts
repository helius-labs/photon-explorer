import { z } from "zod";

// Define the main schema for the objects in the array
export const TokenSchema = z.object({
  address: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  logoURI: z.string().nullable(),
  tags: z.array(z.string()),
  daily_volume: z.number().nullable(),
  freeze_authority: z.string().nullable(),
  mint_authority: z.string().nullable(),
});

// Define the schema for the array of tokens
export const tokenListSchema = z.array(TokenSchema);

export type TokenList = z.infer<typeof tokenListSchema>;
