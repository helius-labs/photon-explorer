import { shorten } from "@/utils/common";
import AccountCharts from "@/components/account/account-charts";

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

export async function generateMetadata({ params }: Props) {
  return {
    title: `Address ${shorten(params.address)} - Metadata | XRAY`,
    description: `JSON metadata for the address ${params.address}`,
  };
}

export default function Page({ params }: Props) {
  return <AccountCharts address={params.address} />;
}
