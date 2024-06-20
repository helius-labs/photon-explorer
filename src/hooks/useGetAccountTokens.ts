import { useCluster } from "@/providers/cluster-provider";
import { Connection, PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

import { useGetTokenListStrict } from "./tokenList";

export type TokenInfoWithPubkey = {
  info: any;
  pubkey: PublicKey;
  logoURI?: string;
  symbol?: string;
  name?: string;
};

export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);
export const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
);

export function useGetAccountTokens(address: string, enabled: boolean = true) {
  const { endpoint } = useCluster();
  const tokenList = useGetTokenListStrict();

  return useQuery({
    queryKey: [endpoint, "getAccountTokens", address],
    queryFn: async () => {
      const { value: tokenAccounts } = await new Connection(
        endpoint,
        "processed",
      ).getParsedTokenAccountsByOwner(new PublicKey(address), {
        programId: TOKEN_PROGRAM_ID,
      });
      const { value: token2022Accounts } = await new Connection(
        endpoint,
        "processed",
      ).getParsedTokenAccountsByOwner(new PublicKey(address), {
        programId: TOKEN_2022_PROGRAM_ID,
      });

      const tokens: TokenInfoWithPubkey[] = tokenAccounts
        .concat(token2022Accounts)
        .map((accountInfo) => {
          const parsedInfo = accountInfo.account.data.parsed.info;
          return { info: parsedInfo, pubkey: accountInfo.pubkey };
        });

      // Fetch symbols and logos for tokens
      if (tokenList.data) {
        const mappedTokenInfos = Object.fromEntries(
          tokenList.data.map((token) => [
            token.address,
            {
              logoURI: token.logoURI,
              name: token.name,
              symbol: token.symbol,
            },
          ]),
        );
        tokens.forEach((token) => {
          const tokenInfo = mappedTokenInfos[token.info.mint.toString()];
          if (tokenInfo) {
            token.logoURI = tokenInfo.logoURI ?? undefined;
            token.symbol = tokenInfo.symbol;
            token.name = tokenInfo.name;
          }
        });
      }

      return tokens;
    },
    enabled: enabled && !!tokenList.data,
  });
}
