import type { Metadata } from "next";

import AccountTokens from "@/components/account/account-tokens";

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

// or Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `Tokens | ${params.address} | Solana`,
    description: `All Tokens owned by the address ${params.address} on Solana`,
  };
}

export default function Page({ params }: Props) {
  return <AccountTokens address={params.address} />;
}
