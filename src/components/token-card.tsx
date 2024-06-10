"use client";

import { Token } from "@/schemas/getTokenAccountsByOwner";

import { useGetTokenListAll } from "@/hooks/tokenlist";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TokenCard({ token }: { token: Token }) {
  const { data, isLoading, isFetching, isError } = useGetTokenListAll();

  if (isError || isLoading || isFetching) return;

  const jupiterTokenInfo = data?.find(
    (item) => item.address === token.account.data.parsed.info.mint,
  );

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12">
        <AvatarImage
          src={jupiterTokenInfo?.logoURI}
          alt={jupiterTokenInfo?.name}
        />
        <AvatarFallback>{jupiterTokenInfo?.name}</AvatarFallback>
      </Avatar>
      <div className="grid gap-1">
        <div className="text-lg font-semibold leading-none">
          {jupiterTokenInfo?.name || token.account.data.parsed.info.mint}
        </div>
        <div className="text-sm text-muted-foreground">
          {token.account.data.parsed.info.tokenAmount?.uiAmount.toLocaleString(
            undefined,
            {
              minimumFractionDigits: 5,
            },
          )}{" "}
          {jupiterTokenInfo?.symbol}
        </div>
      </div>
    </div>
  );
}
