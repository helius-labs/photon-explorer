"use client";

import { LoaderCircle, RotateCw } from "lucide-react";

import {
  TokenInfoWithAddress,
  useGetAccountTokens,
} from "@/hooks/useGetAccountTokens";
import { useGetTokenListAll } from "@/hooks/useGetTokenListAll";

import TokenCard from "@/components/account/token-card";
import Loading from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountTokens({ address }: { address: string }) {
  const { data, isLoading, isFetching, isPending, isError, refetch } =
    useGetAccountTokens(address);

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
  if (isLoading || isPending)
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

  // Filter out tokens that are not in the token list and
  const tokens = data?.filter((tokenInfoWithPubkey: TokenInfoWithAddress) => {
    return (
      tokenInfoWithPubkey.name &&
      tokenInfoWithPubkey.info.tokenAmount?.uiAmount! > 0
    );
  });

  // Sort by token amount
  tokens?.sort(
    (a, b) => b.info.tokenAmount?.uiAmount! - a.info.tokenAmount?.uiAmount!,
  );

  return (
    <Card className="col-span-12">
      <CardContent className="flex flex-col pt-6 gap-4">
        {isLoading && <Loading />}
        {tokens?.length === 0 && <p>No tokens found</p>}
        {tokens?.map((token: TokenInfoWithAddress) => (
          <TokenCard key={token.address} token={token} />
        ))}
      </CardContent>
    </Card>
  );
}
