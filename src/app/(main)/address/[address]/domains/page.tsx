import { shorten } from "@/utils/common";

import AccountDomains from "@/components/account/account-domains";

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

// Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `Address ${shorten(params.address)} - Domains | XRAY`,
    description: `All domains owned by the address ${params.address}`,
  };
}

export default function Page({ params }: Props) {
  return <AccountDomains address={params.address} />;
}
