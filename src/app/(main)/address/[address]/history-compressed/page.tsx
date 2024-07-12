import { shorten } from "@/utils/common";

import CompressionHistory from "@/components/compression/compression-history";

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

// or Dynamic metadata
export async function generateMetadata({ params: { address } }: Props) {
  return {
    title: `Compression Address ${shorten(address)} - History | XRAY`,
    description: `Transaction History for the compression address ${address}`,
  };
}

export default function Page({ params: { address } }: Props) {
  return <CompressionHistory address={address} />;
}
