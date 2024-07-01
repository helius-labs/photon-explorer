import { getTokenListStrict } from "@/server/getTokenList";
import { shorten } from "@/utils/common";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import AccountTokens from "@/components/account/account-tokens";

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

// or Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `Address ${shorten(params.address)} - Tokens | XRAY`,
    description: `All Tokens owned by the address ${params.address}`,
  };
}

export default async function Page({ params }: Props) {
  // Prefetch the token list and hydrate the query client
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["getTokenListStrict"],
    queryFn: getTokenListStrict,
  });

  return (
    // HydrationBoundary is a Client Component, so hydration will happen there.
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AccountTokens address={params.address} />
    </HydrationBoundary>
  );
}
