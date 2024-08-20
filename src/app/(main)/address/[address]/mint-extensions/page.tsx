import { shorten } from "@/utils/common";
import MintExtensions from '@/components/mint-extensions';

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

// Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `Address ${shorten(params.address)} - Anchor IDL | XRAY`,
    description: `Anchor IDL for the program at address ${params.address}`,
  };
}

export default function Page({ params }: Props) {
    return <MintExtensions address={params.address} />;
}
