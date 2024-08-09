import React, { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import Avatar from "boring-avatars";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import { useCluster } from "@/providers/cluster-provider";
import Address from "@/components/common/address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useFetchDomains } from "@/hooks/useFetchDomains";
import { Cluster } from "@/utils/cluster";
import { Skeleton } from "@/components/ui/skeleton";

interface AccountHeaderUnknownProps {
  address: PublicKey;
}

const AccountHeaderUnknown: React.FC<AccountHeaderUnknownProps> = ({ address }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const router = useRouter();
  const { cluster, endpoint } = useCluster();
  const fallbackAddress = address.toBase58();
  const { data: userDomains, isLoading: loadingDomains } = useFetchDomains(address.toBase58(), endpoint);

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const isLocalOrTestNet = [Cluster.Localnet, Cluster.Testnet, Cluster.Custom].includes(cluster);

  if (loadingDomains) {
    return (
      <div className="mx-[-1rem] md:mx-0">
        <Card className="mb-8 w-full space-y-4 p-6 md:space-y-6">
          <CardHeader className="relative flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-6">
            <div className="relative flex-shrink-0">
              <Skeleton className="h-44 w-44 rounded-lg" />
            </div>
            <div className="flex w-full flex-col">
              <div className="flex w-full flex-col justify-between md:flex-row md:items-start">
                <div className="max-w-sm flex-grow text-center md:text-left">
                  <CardTitle className="text-3xl font-medium leading-none">
                    <div className="flex flex-col items-center md:flex-row md:justify-start">
                      <Skeleton className="h-8 w-48 mb-2" />
                      <div className="mt-2 flex space-x-2 md:ml-2 md:mt-0">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  </CardTitle>
                  <div className="mt-2 text-sm text-muted-foreground flex justify-center md:justify-start">
                    <Skeleton className="h-4 w-36" />
                  </div>
                </div>
              </div>
              <div className="md:text-md mt-2 max-w-md text-center text-sm text-foreground md:text-left">
                <Skeleton className="h-6 w-full mb-2" />
                <div className="mt-4 flex justify-center space-x-4 md:justify-start">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="text-md grid grid-cols-1 gap-4 text-center text-muted-foreground sm:grid-cols-2 md:text-left lg:grid-cols-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-[-1rem] md:mx-0">
      <Card className="w-full">
        <CardHeader className="flex flex-col items-center gap-4 md:flex-row">
          <div className="relative flex items-center justify-center w-full md:w-auto">
            <Avatar
              size={80}
              name={fallbackAddress}
              variant="pixel"
              colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
            />
            {isLocalOrTestNet && (
              <div className="absolute top-0 right-0 md:hidden">
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
            )}
          </div>
          <div className="flex flex-col items-center text-center w-full md:flex-row md:items-center md:text-left md:justify-between">
            <div className="text-2xl font-medium leading-none md:text-left">
              <div className="flex flex-col items-center justify-center gap-2 md:flex-row md:justify-start">
                <Address pubkey={address} short />
                <Badge variant="success">Unknown</Badge>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-2 md:ml-auto md:justify-start">
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
          {isLocalOrTestNet && (
            <div className="hidden md:flex ml-auto self-start font-medium mt-4 md:mt-0">
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
          )}
        </CardHeader>
      </Card>
    </div>
  );
};

export default AccountHeaderUnknown;
