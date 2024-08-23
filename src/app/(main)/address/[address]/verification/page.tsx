import { shorten } from "@/utils/common";
import ProgramVerificationInfo from "@/components/account/program-verification-info";

type Props = Readonly<{
  params: {
    address: string;
  };
}>;

// Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `Address ${shorten(params.address)} - Program Verification | XRAY`,
    description: `Verification information for the program at address ${params.address}`,
  };
}

export default function Page({ params }: Props) {
  return <ProgramVerificationInfo programId={params.address} />;
}