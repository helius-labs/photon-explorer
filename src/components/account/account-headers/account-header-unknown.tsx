import React, { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import Avatar from "boring-avatars";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import { useCluster } from "@/providers/cluster-provider";
import Address from "@/components/common/address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useFetchDomains } from "@/hooks/useFetchDomains";

interface AccountHeaderUnknownProps {
  address: PublicKey;
}

const AccountHeaderUnknown: React.FC<AccountHeaderUnknownProps> = ({ address }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const router = useRouter();
  const { endpoint } = useCluster();
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

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-center gap-4 md:flex-row">
        <div className="relative flex items-center justify-center w-full md:w-auto">
          <Avatar
            size={80}
            name={fallbackAddress}
            variant="marble"
            colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
          />
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
        </div>
        <div className="flex flex-col items-center text-center w-full md:flex-row md:items-center md:text-left md:justify-between">
          <div className="text-2xl font-medium leading-none md:text-left">
            <div className="flex flex-col items-center justify-center gap-2 md:flex-row md:justify-start">
              <Address pubkey={address} short />
              <Badge className="md:hidden" variant="success">Unknown</Badge>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2 md:ml-auto md:mt-0 md:justify-start">
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
      </CardHeader>
    </Card>
  );
};

export default AccountHeaderUnknown;
