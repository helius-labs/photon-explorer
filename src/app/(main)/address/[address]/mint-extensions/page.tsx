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
    title: `Address ${shorten(params.address)} - Mint Extensions | XRAY`,
    description: `Mint extensions for the token account at address ${params.address}`,
  };
}

export default function Page({ params }: Props) {
    return <MintExtensions address={params.address} />;
}
