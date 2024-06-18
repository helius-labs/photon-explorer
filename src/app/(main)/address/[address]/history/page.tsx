import AcccountHistory from "@/components/account/account-history";

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

// or Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `History | ${params.address} | Solana`,
    description: `All transactions for the address ${params.address} on Solana`,
  };
}

export default function Page({ params }: Props) {
  return <AcccountHistory address={params.address} />;
}
