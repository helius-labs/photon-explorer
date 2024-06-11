import { Metadata } from "next/types";

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
  return <>TODO: Add history</>;
}
