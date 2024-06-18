import CompressedTransactionsByHash from "@/components/account/compressed-transactions-by-hash";

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

// or Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `Compressed Transaction | ${params.address} | Solana`,
    description: `All Compressed Transactions for the address ${params.address} on Solana`,
  };
}

export default function Page({ params }: Props) {
  return <CompressedTransactionsByHash hash={params.address} />;
}
