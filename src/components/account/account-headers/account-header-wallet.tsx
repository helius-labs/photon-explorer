import React, { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import Image from "next/image";
import Avatar from "boring-avatars";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import { useGetCompressedBalanceByOwner } from "@/hooks/compression";
import { useFetchDomains } from "@/hooks/useFetchDomains";
import { lamportsToSolString, fetchSolPrice } from "@/utils/common";
import Address from "@/components/common/address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
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
  const [currentSolPrice, setCurrentSolPrice] = useState<number | null>(solPrice);
  const router = useRouter();
  const { endpoint } = useCluster();
  const { data: compressedBalance } = useGetCompressedBalanceByOwner(address.toBase58());
  const { data: userDomains, isLoading: loadingDomains } = useFetchDomains(address.toBase58(), endpoint);

  const solBalance = accountInfo?.lamports ? parseFloat(lamportsToSolString(accountInfo.lamports, 2)) : 0;
  const solBalanceUSD = currentSolPrice ? (solBalance * currentSolPrice).toFixed(2) : null;
  const fallbackAddress = address.toBase58();

  useEffect(() => {
    if (!solPrice) {
      fetchSolPrice().then(price => setCurrentSolPrice(price));
    }
  }, [solPrice]);

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-center gap-4 md:flex-row">
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
            <div className="flex flex-col items-center md:items-start gap-2 text-lg text-muted-foreground mt-4 md:mt-2">
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
            </div>
            <div className="ml-auto mt-2 md:mt-2 flex flex-wrap gap-2">
            {!loadingDomains && userDomains && userDomains.length > 0 && (
              userDomains.slice(0, 3).map((domain: any) => (
                <Badge key={domain.domain} variant="outline">
                  {domain.type === "sns-domain" ? domain.name : domain.domain}
                </Badge>
              ))
            )}
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
      </CardHeader>
    </Card>
  );
};

export default AccountHeaderWallets;
