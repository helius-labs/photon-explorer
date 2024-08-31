import { shorten } from "@/utils/common";
import NiftyAssetExtensions from "@/components/nifty-asset-extensions";

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

// Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `Address ${shorten(params.address)} - Nifty Asset Extensions | XRAY`,
    description: `Nifty Asset extensions for the account at address ${params.address}`,
  };
}

export default function Page({ params }: Props) {
    return <NiftyAssetExtensions address={params.address} />;
}