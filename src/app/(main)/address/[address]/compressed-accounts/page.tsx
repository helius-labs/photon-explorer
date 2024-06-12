import CompressedAccounts from "@/components/account/compressed-accounts";

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

// or Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `Compressed Accounts | ${params.address} | Solana`,
    description: `All Compressed Accounts for the address ${params.address} on Solana`,
  };
}

export default function Page({ params }: Props) {
  return <CompressedAccounts address={params.address} />;
}
