import { useCluster } from "@/providers/cluster-provider";
import { getTokenPrices } from "@/server/getTokenPrice";
import { Token } from "@/types/token";
import { Cluster } from "@/utils/cluster";
import { normalizeTokenAmount } from "@/utils/common";
import { getTokenInfos } from "@/utils/token-info";
import { Connection, PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);
export const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
);

export function useGetAccountTokens(address: string, enabled: boolean = true) {
  const { cluster, endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getAccountTokens", address],
    queryFn: async () => getAccountTokens(address, cluster, endpoint),
    enabled,
  });
}

export async function getAccountTokens(
  address: string,
  cluster: Cluster,
  endpoint: string,
) {
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

  const tokens: Token[] = tokenAccounts
    .concat(token2022Accounts)
    .map((accountInfo) => {
      const parsedInfo = accountInfo.account.data.parsed.info;
      return {
        raw: parsedInfo,
        pubkey: accountInfo.pubkey,
        mint: new PublicKey(parsedInfo.mint),
        amount: parsedInfo.tokenAmount.amount,
        decimals: parsedInfo.tokenAmount.decimals,
      };
    });

  // Fetch symbols and logos for tokens
  const tokenMintInfos = await getTokenInfos(
    tokens.map((t) => t.mint),
    cluster,
    endpoint,
  );
  if (tokenMintInfos) {
    const mappedTokenInfos = Object.fromEntries(
      tokenMintInfos.map((t) => [
        t.address,
        {
          logoURI: t.logoURI,
          name: t.name,
          symbol: t.symbol,
        },
      ]),
    );
    tokens.forEach((t) => {
      const tokenInfo = mappedTokenInfos[t.mint.toString()];
      if (tokenInfo) {
        t.logoURI = tokenInfo.logoURI ?? undefined;
        t.symbol = tokenInfo.symbol;
        t.name = tokenInfo.name;
      }
    });
  }

  // Fetch prices for tokens
  const tokenPrices = await getTokenPrices(
    tokens.map((t) => t.mint.toBase58()),
  );
  if (tokenPrices) {
    tokens.forEach((t) => {
      const tokenPrice = tokenPrices.data[t.mint.toBase58()];
      if (tokenPrice) {
        t.price = tokenPrice.price;

        if (t.decimals && t.decimals) {
          t.value = normalizeTokenAmount(t.amount, t.decimals) * t.price;
        }
      }
    });
  }

  tokens.sort((a, b) => b.value! - a.value!);

  return tokens;
}
