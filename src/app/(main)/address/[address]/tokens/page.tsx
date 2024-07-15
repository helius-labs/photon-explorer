import { shorten } from "@/utils/common";

import AccountTokens from "@/components/account/account-tokens";

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

// or Dynamic metadata
export async function generateMetadata({ params: { address } }: Props) {
  return {
    title: `Address ${shorten(address)} - Tokens | XRAY`,
    description: `All Tokens owned by the address ${address}`,
  };
}

export default async function Page({ params: { address } }: Props) {
  return <AccountTokens address={address} />;
}
