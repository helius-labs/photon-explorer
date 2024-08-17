import { shorten } from "@/utils/common";
import SecurityTxtDisplay from "@/components/account/account-security-txt";

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

// Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `Address ${shorten(params.address)} - Security.txt | XRAY`,
    description: `Security.txt information for the program at address ${params.address}`,
  };
}

export default function Page({ params }: Props) {
  return <SecurityTxtDisplay programId={params.address} />;
}