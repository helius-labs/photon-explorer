"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Avatar from "boring-avatars";
import Image from "next/image";
import noImg from "@/../public/assets/noimg.svg";
import solLogo from "@/../public/assets/solanaLogoMark.svg";
import { MoreVertical } from "lucide-react";

import {
  AccountInfo,
  ParsedAccountData,
  PublicKey,
  RpcResponseAndContext,
} from "@solana/web3.js";
import { CompressedAccountWithMerkleContext } from "@lightprotocol/stateless.js";
import { UseQueryResult } from "@tanstack/react-query";
import { useCluster } from "@/providers/cluster-provider";

import cloudflareLoader from "@/utils/imageLoader";
import { lamportsToSolString } from "@/utils/common";

import { useGetCompressedBalanceByOwner } from "@/hooks/compression";
import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";
import { useFetchDomains } from "@/hooks/useFetchDomains";

import Address from "@/components/common/address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAccountType, AccountType } from "@/utils/account";

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

export function AccountHeader({
  address,
  accountInfo,
  compressedAccount,
}: {
  address: PublicKey;
  accountInfo: UseQueryResult<RpcResponseAndContext<AccountInfo<Buffer | ParsedAccountData> | null>, Error>;
  compressedAccount: UseQueryResult<CompressedAccountWithMerkleContext | null, Error>;
}) {
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const router = useRouter();
  const { endpoint, cluster } = useCluster();

  const accountType = accountInfo.data?.value ? getAccountType(accountInfo.data.value) : AccountType.Unknown;

  // Fetch compressed balance for the address
  const { data: compressedBalance } = useGetCompressedBalanceByOwner(
    address.toBase58(),
  );

  // Use the custom hook to fetch all domain names
  const { data: userDomains, isLoading: loadingDomains } = useFetchDomains(
    address.toBase58(),
    endpoint
  );

  // Fetch the token list
  const { data: tokenList, isLoading: tokenListLoading } =
    useGetTokenListStrict();

  // Determine the type of account and token name if applicable
  const accountDetails = React.useMemo(() => {
    const addressStr = address.toBase58();
    let type: string | null = null;
    let name: string | null = null;
    let imageURI: string | null = null;

    if (tokenList) {
      const token = tokenList.find((token) => token.address === addressStr);
      if (token) {
        type = "Token";
        name = token.name || null;
        imageURI = token.logoURI || null;
      }
    }

    return { tokenName: name, tokenImageURI: imageURI };
  }, [address, tokenList]);

  useEffect(() => {
    const getSolPrice = async () => {
      const price = await fetchSolPrice();
      setSolPrice(price);
    };

    getSolPrice();
  }, []);

  const solBalance = accountInfo.data?.value?.lamports
    ? parseFloat(lamportsToSolString(accountInfo.data.value.lamports, 2))
    : 0;
  const solBalanceUSD = solPrice ? (solBalance * solPrice).toFixed(2) : null;

  return (
    <div className="mb-8 flex flex-col items-center gap-4 md:flex-row">
      {accountDetails.tokenImageURI ? (
        <Image
          loader={cloudflareLoader}
          src={accountDetails.tokenImageURI}
          alt={accountDetails.tokenName || "Token"}
          width={128}
          height={128}
          loading="eager"
          className="h-16 w-16 rounded-full"
          onError={(event: any) => {
            event.target.id = "noimg";
            event.target.srcset = noImg.src;
          }}
        />
      ) : (
        <Avatar
          size={64}
          name={address.toBase58()}
          variant="marble"
          colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
        />
      )}
      <div className="grid gap-2">
        <div className="text-center text-3xl font-medium leading-none md:text-left">
          <div className="flex items-center justify-center gap-2 md:justify-start">
            {accountDetails.tokenName || <Address pubkey={address} />}
            {accountType && <Badge variant="success">{accountType}</Badge>}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 md:flex-row">
          {accountInfo.isLoading || tokenListLoading ? (
            <Skeleton className="h-7 w-[250px]" />
          ) : (
            <>
              {accountInfo.data?.value !== null || compressedAccount.data !== null || (userDomains && userDomains.length > 0) ? (
                <>
                  <div className="flex flex-col items-center text-lg text-muted-foreground">
                    <span className="flex items-center">
                      <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-black p-1.5">
                        <Image
                          src={solLogo}
                          alt="SOL logo"
                          loading="eager"
                          width={24}
                          height={24}
                        />
                      </div>
                      {`${lamportsToSolString(
                        accountInfo.data?.value?.lamports || 0,
                        2,
                      )} SOL`}
                    </span>
                    {solBalanceUSD && (
                      <span className="ml-0 md:ml-6 mt-1 md:mt-0 text-xs text-muted-foreground opacity-80">
                        ${solBalanceUSD} USD
                      </span>
                    )}
                  </div>
                  {compressedBalance && compressedBalance.value && (
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
                      {` | ${lamportsToSolString(
                        compressedBalance.value,
                        2,
                      )} COMPRESSED SOL`}
                    </span>
                  )}
                  {compressedAccount.data && (
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
                      {`${lamportsToSolString(
                        compressedAccount.data.lamports,
                        2,
                      )} SOL`}
                    </span>
                  )}
                  {!loadingDomains && userDomains && userDomains.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {userDomains.slice(0, 3).map((domain) => (
                        <Badge key={domain.domain} variant="outline">
                          {domain.type === "sns-domain"
                            ? domain.name
                            : domain.domain}
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <span className="text-lg text-muted-foreground">
                  Account does not exist
                </span>
              )}
            </>
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
                  accountInfo.refetch();
                }}
              >
                Refresh
              </DropdownMenuItem>
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
