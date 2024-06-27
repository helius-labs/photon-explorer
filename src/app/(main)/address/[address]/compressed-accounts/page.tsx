import CompressedAccounts from "@/components/account/compressed-accounts";
import { shorten } from "@/utils/common";

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

// or Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `Address ${shorten(params.address)} - History | Compressed Accounts`,
    description: `All Compressed Accounts for the address ${params.address}`,
  };
}

export default function Page({ params }: Props) {
  return <CompressedAccounts address={params.address} />;
}
