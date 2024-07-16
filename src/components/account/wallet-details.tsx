import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import solLogo from "@/../public/assets/solanaLogoMark.svg";
import { lamportsToSolString } from "@/utils/common";

export default function WalletDetails({
  solBalance,
  solBalanceUSD,
  compressedBalance,
  userDomains,
  loadingDomains,
}: {
  solBalance: number;
  solBalanceUSD: string | null;
  compressedBalance: any;
  userDomains: any;
  loadingDomains: boolean;
}) {
  return (
    <div className="flex flex-col items-center md:items-start gap-2 text-lg text-muted-foreground mt-4 md:mt-1">
      <div className="flex items-center">
        <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-black p-1.5">
          <Image
            src={solLogo}
            alt="SOL logo"
            loading="eager"
            width={24}
            height={24}
          />
        </div>
        <span>{`${solBalance.toFixed(2)} SOL`}</span>
        {solBalanceUSD && (
          <span className="ml-4 text-sm text-muted-foreground opacity-80">
            ${solBalanceUSD} USD
          </span>
        )}
      </div>
      {compressedBalance && compressedBalance.value && (
        <div className="flex items-center">
          <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-black p-1.5">
            <Image
              src={solLogo}
              alt="SOL logo"
              loading="eager"
              width={24}
              height={24}
            />
          </div>
          {` | ${lamportsToSolString(
            compressedBalance.value,
            2,
          )} COMPRESSED SOL`}
        </div>
      )}
      {!loadingDomains && userDomains && userDomains.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {userDomains.slice(0, 3).map((domain: any) => (
            <Badge key={domain.domain} variant="outline">
              {domain.type === "sns-domain" ? domain.name : domain.domain}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}