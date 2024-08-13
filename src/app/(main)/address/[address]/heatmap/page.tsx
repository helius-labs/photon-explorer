import { shorten } from "@/utils/common";

import AccountHeatmap from "@/components/account/account-heatmap";

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

// Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `Heatmap ${shorten(params.address)} - Heatmap | XRAY`,
    description: `A heatmap of all transactions for address ${params.address}`,
  };
}

export default function Page({ params }: Props) {
  return <AccountHeatmap address={params.address} />;
}
