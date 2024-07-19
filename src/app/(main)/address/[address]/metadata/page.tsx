import { shorten } from "@/utils/common";
import AccountMetadata from "@/components/account/account-metadata";

type Props = {
  params: {
    address: string;
  };
};

// or Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `Address ${shorten(params.address)} - Metadata | XRAY`,
    description: `JSON metadata for the address ${params.address}`,
  };
}

export default function Page({ params }: Props) {
  return <AccountMetadata address={params.address} />;
}
