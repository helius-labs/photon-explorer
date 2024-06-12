import { useCluster } from "@/providers/cluster-provider";
import {
  Address,
  JsonParsedTokenAccount,
  address,
  createSolanaRpc,
} from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

import { useGetTokenListAll } from "./useGetTokenListAll";

export type TokenInfoWithAddress = {
  info: JsonParsedTokenAccount;
  address: Address;
  logoURI?: string;
  symbol?: string;
  name?: string;
};

export const TOKEN_PROGRAM_ID = address(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);
export const TOKEN_2022_PROGRAM_ID = address(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
);

export function useGetAccountTokens(
  addressInput: string,
  enabled: boolean = true,
) {
  const { endpoint } = useCluster();
  const tokenList = useGetTokenListAll();

  return useQuery({
    queryKey: [endpoint, "getAccountTokens", addressInput],
    queryFn: async () => {
      // Create an RPC client.
      const rpc = createSolanaRpc(endpoint);

      const { value: tokenAccounts } = await rpc
        .getTokenAccountsByOwner(
          address(addressInput),
          {
            programId: TOKEN_PROGRAM_ID,
          },
          {
            encoding: "jsonParsed",
            commitment: "processed",
          },
        )
        .send();

      const { value: token2022Accounts } = await rpc
        .getTokenAccountsByOwner(
          address(addressInput),
          {
            programId: TOKEN_2022_PROGRAM_ID,
          },
          {
            encoding: "jsonParsed",
            commitment: "processed",
          },
        )
        .send();

      const tokens: TokenInfoWithAddress[] = tokenAccounts
        .concat(token2022Accounts)
        .map((accountInfo) => {
          const parsedInfo = accountInfo.account.data.parsed.info;
          return { info: parsedInfo, address: accountInfo.pubkey };
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
