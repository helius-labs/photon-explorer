import { z } from "zod";

export const itemSchema = z.object({
  interface: z.string(),
  id: z.string(),
  authorities: z.array(z.any()).optional(),
  creators: z.array(z.any()).optional(),
  mutable: z.boolean().optional(),
  burnt: z.boolean().optional(),

  mint_extensions: z.object({
    metadata: z.object({
      name: z.string().optional(),
      symbol: z.string().optional(),
      uri: z.string().optional(),
      additional_metadata: z.array(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      ).optional(),
    }).optional(),
  }).optional(),

  token_info: z.object({
    symbol: z.string().optional(),
    token_program: z.string().optional(),
    associated_token_address: z.string().optional(),
    price_info: z.object({
      price_per_token: z.number().optional(),
      total_price: z.number().optional(),
      currency: z.string().optional(),
    }).optional(),
  }).optional(),
  
  content: z.object({
    links: z.object({
      image: z.string().optional(),
    }).optional(),
    metadata: z.object({
      name: z.string().optional(),
      symbol: z.string().optional(),
    }).optional(),
  }).optional(),
});

export type Item = z.infer<typeof itemSchema>;

export const resultSchema = z.object({
  items: z.array(itemSchema),
  nativeBalance: z.object({
    price_per_sol: z.number().optional(),
    total_price: z.number().optional(),
  }).optional(),
});

export const searchAssetsSchema = z.object({
  result: resultSchema,
});

export type SearchAssets = z.infer<typeof searchAssetsSchema>;
