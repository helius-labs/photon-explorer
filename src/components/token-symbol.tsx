"use client";

import { useGetTokenListAll } from "@/hooks/tokenlist";

import Loading from "@/components/loading";

export default function TokenSymbol({ children }: { children: string }) {
  const { data, isLoading, isFetching, isError, refetch } =
    useGetTokenListAll();

  if (isError) return;

  if (isLoading || isFetching) return <Loading />;

  const symbol = data?.find((item) => item.address === children)?.symbol;

  return <>{symbol}</>;
}
