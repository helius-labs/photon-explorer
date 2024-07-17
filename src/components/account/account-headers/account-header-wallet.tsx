import React, { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import Image from "next/image";
import Avatar from "boring-avatars";
import { useRouter } from "next/navigation";
import { CheckIcon, Copy, MoreVertical } from "lucide-react";
import { useGetCompressedBalanceByOwner } from "@/hooks/compression";
import { useFetchDomains } from "@/hooks/useFetchDomains";
import { lamportsToSolString, shortenLong } from "@/utils/common";
import Address from "@/components/common/address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import solLogo from "@/../public/assets/solanaLogoMark.svg";
import { useCluster } from "@/providers/cluster-provider";

interface AccountHeaderWalletsProps {
  address: PublicKey;
  solPrice: number | null;
  accountInfo: any;
}

const AccountHeaderWallets: React.FC<AccountHeaderWalletsProps> = ({ address, solPrice, accountInfo }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const router = useRouter();
  const { endpoint } = useCluster();
  const { data: compressedBalance } = useGetCompressedBalanceByOwner(address.toBase58());
  const { data: userDomains, isLoading: loadingDomains } = useFetchDomains(address.toBase58(), endpoint);

  const solBalance = accountInfo?.lamports ? parseFloat(lamportsToSolString(accountInfo.lamports, 2)) : 0;
  const solBalanceUSD = solPrice ? (solBalance * solPrice).toFixed(2) : null;
  const fallbackAddress = address.toBase58();

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  return (
    <div className="mb-8 flex flex-col items-center gap-4 md:flex-row">
      <div className="flex-shrink-0">
        <Avatar
          size={80}
          name={fallbackAddress}
          variant="marble"
          colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
        />
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
        <div className="text-center text-3xl font-medium leading-none md:text-left">
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <Address pubkey={address} short />
            <Badge variant="success">Wallet</Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-2 md:mt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="mr-2 h-5 w-5 rounded-[6px] [&_svg]:size-3.5"
                    onClick={() => {
                      navigator.clipboard.writeText(address.toBase58());
                      setHasCopied(true);
                    }}
                  >
                    <span className="sr-only">Copy</span>
                    {hasCopied ? <CheckIcon /> : <Copy />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy address</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>{shortenLong(address.toBase58())}</span>
                </TooltipTrigger>
                <TooltipContent>{address.toBase58()}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="mt-4 md:mt-0 flex flex-grow justify-center">
            <Card className="w-full md:mr-4">
              <CardHeader>
                <CardTitle>Wallet Details</CardTitle>
              </CardHeader>
              <CardContent>
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
                      {` | ${lamportsToSolString(compressedBalance.value, 2)} COMPRESSED SOL`}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="ml-auto self-start font-medium mt-4 md:mt-0">
        <div className="ml-auto flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  router.push(`/address/${address.toBase58()}/compressed-accounts?cluster=${endpoint}`);
                }}
              >
                Compressed Accounts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default AccountHeaderWallets;
