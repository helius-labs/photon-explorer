import type { Metadata } from "next";

import { shorten } from "@/utils/common";

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

export default function Page({ params }: Props) {
  return <AccountTokens address={params.address} />;
}
