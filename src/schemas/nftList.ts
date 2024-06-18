import { z } from "zod";

export const nftSchema = z.object({
  id: z.string(),
  content: z.object({
    metadata: z.object({
      name: z.string().optional(),
    }).optional(),
    files: z.array(z.object({
      uri: z.string(),
    })).optional(),
  }).optional(),
  interface: z.string(),
});

export const nftsResponseSchema = z.object({
  jsonrpc: z.string(),
  result: z.object({
    items: z.array(nftSchema),
  }),
});
