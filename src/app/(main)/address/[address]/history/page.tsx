import AcccountHistory from "@/components/account/account-history";
import { shorten } from "@/lib/utils";

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

// or Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `Address ${shorten(params.address)} - History | XRAY`,
    description: `Transaction History for the address ${params.address}`,
  };
}

export default function Page({ params }: Props) {
  return <AcccountHistory address={params.address} />;
}
