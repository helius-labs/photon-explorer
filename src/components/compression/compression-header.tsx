"use client";

import solLogo from "@/../public/assets/solanaLogoMark.svg";
import { useCluster } from "@/providers/cluster-provider";
import { lamportsToSolString } from "@/utils/common";
import { CompressedAccountWithMerkleContext } from "@lightprotocol/stateless.js";
import { PublicKey } from "@solana/web3.js";
import Avatar from "boring-avatars";
import { MoreVertical } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Address from "@/components/common/address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const fetchSolPrice = async () => {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
    );
    const data = await response.json();
    return data.solana.usd;
  } catch (error) {
    console.error("Error fetching SOL price:", error);
    return null;
  }
};

export function CompressionHeader({
  address,
  compressedAccount,
}: {
  address: PublicKey;
  compressedAccount: CompressedAccountWithMerkleContext;
}) {
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const router = useRouter();
  const { endpoint, cluster } = useCluster();

  useEffect(() => {
    const getSolPrice = async () => {
      const price = await fetchSolPrice();
      setSolPrice(price);
    };

    getSolPrice();
  }, []);

  return (
    <div className="mb-8 flex flex-col items-center gap-4 md:flex-row">
      <Avatar
        size={64}
        name={address.toBase58()}
        variant="marble"
        colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
      />
      <div className="grid gap-2">
        <div className="text-center text-3xl font-medium leading-none md:text-left">
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <Address pubkey={address} />
            <Badge variant="success">Compressed</Badge>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 md:flex-row">
          {compressedAccount && (
            <span className="flex items-center text-lg text-muted-foreground">
              <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-black p-1.5">
                <Image
                  src={solLogo}
                  alt="SOL logo"
                  loading="eager"
                  width={24}
                  height={24}
                />
              </div>
              {`${lamportsToSolString(compressedAccount.lamports, 2)} SOL`}
            </span>
          )}
        </div>
      </div>
      <div className="ml-auto self-start font-medium">
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
                  router.push(
                    `/address/${address.toBase58()}/compressed-accounts?cluster=${cluster}`,
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
  );
}
