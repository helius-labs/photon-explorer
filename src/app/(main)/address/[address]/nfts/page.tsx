import { shorten } from "@/utils/common";

import AcccountNFTs from "@/components/account/account-nfts";

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

// or Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `Address ${shorten(params.address)} - NFTs | XRAY`,
    description: `All NFTs owned by the address ${params.address}`,
  };
}

export default function Page({ params }: Props) {
  return <AcccountNFTs address={params.address} />;
}
