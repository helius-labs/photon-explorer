import solLogo from "@/../public/assets/solanaLogoMark.svg";
import { useCluster } from "@/providers/cluster-provider";
import { fetchSolPrice, lamportsToSolString } from "@/utils/common";
import { formatCurrencyValue, formatNumericValue } from "@/utils/numbers";
import { PublicKey } from "@solana/web3.js";
import Avatar from "boring-avatars";
import { MoreVertical } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { useGetCompressedBalanceByOwner } from "@/hooks/compression";
import { useFetchDomains } from "@/hooks/useFetchDomains";

import Address from "@/components/common/address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AccountHeaderWalletsProps {
  address: PublicKey;
  solPrice: number | null;
  accountInfo: any;
}

const AccountHeaderWallets: React.FC<AccountHeaderWalletsProps> = ({
  address,
  solPrice,
  accountInfo,
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [currentSolPrice, setCurrentSolPrice] = useState<number | null>(
    solPrice,
  );
  const router = useRouter();
  const { endpoint } = useCluster();
  const { data: compressedBalance } = useGetCompressedBalanceByOwner(
    address.toBase58(),
  );
  const { data: userDomains, isLoading: loadingDomains } = useFetchDomains(
    address.toBase58(),
    endpoint,
  );

  const solBalance = accountInfo?.lamports
    ? parseFloat(lamportsToSolString(accountInfo.lamports, 2))
    : 0;
  const solBalanceUSD = currentSolPrice
    ? formatCurrencyValue(solBalance * currentSolPrice, 2)
    : null;
  const fallbackAddress = address.toBase58();

  useEffect(() => {
    if (!solPrice) {
      fetchSolPrice().then((price) => setCurrentSolPrice(price));
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
    <div className="mx-[-1rem] md:mx-0">
      <Card className="w-full">
        <CardHeader className="flex flex-col gap-4 items-center md:flex-row md:items-center">
          <div className="w-full flex flex-col items-center md:flex-row md:w-auto md:justify-between">
            <div className="flex items-center justify-center w-full md:w-auto relative">
              <Avatar
                size={80}
                name={fallbackAddress}
                variant="marble"
                colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
              />
              <div className="absolute right-0 md:hidden">
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
                        router.push(
                          `/address/${address.toBase58()}/compressed-accounts?cluster=${endpoint}`,
                        );
                      }}
                    >
                      Compressed Accounts
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col items-center md:flex-row md:items-center md:justify-between mt-4 md:mt-0">
            <div className="text-center text-3xl font-medium leading-none md:text-left">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <Address pubkey={address} short />
                <Badge variant="success">Wallet</Badge>
              </div>
              <div className="mt-4 flex flex-col items-center gap-2 text-lg text-muted-foreground md:mt-2 md:items-start">
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
                  <span>{`${formatNumericValue(solBalance)} SOL`}</span>
                  {solBalanceUSD && (
                    <span className="ml-4 text-sm text-muted-foreground opacity-80">
                      {solBalanceUSD} USD
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
              </div>
              <div className="ml-auto mt-2 flex flex-wrap gap-2 justify-center md:mt-2 md:justify-start">
                {!loadingDomains &&
                  userDomains &&
                  userDomains.length > 0 &&
                  userDomains.slice(0, 3).map((domain: any, index: number) => (
                    <Badge key={index} variant="outline">
                      {domain.type === "sns-domain"
                        ? domain.name
                        : domain.domain}
                    </Badge>
                  ))}
                {loadingDomains && (
                  <div className="flex gap-2">
                    <Badge variant="outline" className="invisible">
                      Loading
                    </Badge>
                    <Badge variant="outline" className="invisible">
                      Loading
                    </Badge>
                    <Badge variant="outline" className="invisible">
                      Loading
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block ml-auto mt-4 md:mt-0">
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
                    router.push(
                      `/address/${address.toBase58()}/compressed-accounts?cluster=${endpoint}`,
                    );
                  }}
                >
                  Compressed Accounts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default AccountHeaderWallets;
