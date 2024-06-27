import type { Metadata } from "next";

import AccountTokens from "@/components/account/account-tokens";
import { shorten } from "@/utils/common";

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
