"use client";

import { LoaderCircle, RotateCw } from "lucide-react";

import { Token } from "@/schemas/getTokenAccountsByOwner";

import { useGetTokenListAll } from "@/hooks/tokenlist";
import { useGetTokenAccountsByOwner } from "@/hooks/web3";

import Loading from "@/components/loading";
import TokenCard from "@/components/token-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Tokens({ address }: { address: string }) {
  const { data, isLoading, isFetching, isError, refetch } =
    useGetTokenAccountsByOwner(address);

  const tokenList = useGetTokenListAll();

  // TODO: Refactor jsx
  if (isError)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Token Accounts</CardTitle>
          </div>
          <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
            {isFetching ? (
              <>
                <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              <>
                <RotateCw className="mr-1 h-4 w-4" />
                Retry
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div>Failed to load</div>
        </CardContent>
      </Card>
    );
  if (isLoading || tokenList.isLoading)
    return (
      <Card className="col-span-12">
        <CardContent className="flex flex-col pt-6 gap-4">
          {[0, 1, 2, 3, 4, 5].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );

  // Filter out tokens that are not in the token list
  let tokens = data?.result.value.filter((value: Token) => {
    const token = tokenList.data?.find(
      (item: { address: string }) =>
        item.address === value.account.data.parsed.info.mint,
    );

    return token && value.account.data.parsed.info.tokenAmount?.uiAmount! > 0;
  });

  tokens = tokens?.sort((a: Token, b: Token) => {
    return (
      b.account.data.parsed.info.tokenAmount?.uiAmount! -
      a.account.data.parsed.info.tokenAmount?.uiAmount!
    );
  });

  return (
    <Card className="col-span-12">
      <CardContent className="flex flex-col pt-6 gap-4">
        {isLoading && <Loading />}
        {tokens?.map((token: Token) => (
          <TokenCard key={token.pubkey} token={token} />
        ))}
      </CardContent>
    </Card>
  );
}
