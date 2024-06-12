import AcccountNFTs from "@/components/account/account-nfts";

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

// or Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `NFTs | ${params.address} | Solana`,
    description: `All NFTs owned by the address ${params.address} on Solana`,
  };
}

export default function Page({ params }: Props) {
  return <AcccountNFTs address={params.address} />;
}
