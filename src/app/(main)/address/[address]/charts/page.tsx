import AccountCharts from "@/components/account/account-charts";
import { shorten } from "@/utils/common";

type Props = Readonly<{
  params: {
    address: string;
    symbol?: string;
  };
}>;

// Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `${shorten(params.address)} - Charts | XRAY`,
    description: `Charts for ${params.symbol}`,
  };
}

export default function Page({ params }: Props) {
  const { address } = params;

  return (
    <div>
      <AccountCharts address={address} />
    </div>
  );
}
