"use client";

import noImg from "@/../public/assets/noimg.svg";
import solLogo from "@/../public/assets/solanaLogoMark.svg";
import { useCluster } from "@/providers/cluster-provider";
import { lamportsToSolString } from "@/utils/common";
import cloudflareLoader from "@/utils/imageLoader";
import { useUserDomains } from "@/utils/name-service";
import { PROGRAM_INFO_BY_ID } from "@/utils/programs";
import { SerumMarketRegistry } from "@/utils/serumMarketRegistry";
import { CompressedAccountWithMerkleContext } from "@lightprotocol/stateless.js";
import {
  AccountInfo,
  ParsedAccountData,
  PublicKey,
  RpcResponseAndContext,
} from "@solana/web3.js";
import { UseQueryResult } from "@tanstack/react-query";
import Avatar from "boring-avatars";
import { MoreVertical } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

import { useGetCompressedBalanceByOwner } from "@/hooks/compression";
import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";

import Address from "@/components/common/address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export function AccountHeader({
  address,
  accountInfo,
  compressedAccount,
}: {
  address: PublicKey;
  accountInfo: UseQueryResult<
    RpcResponseAndContext<AccountInfo<Buffer | ParsedAccountData> | null>,
    Error
  >;
  compressedAccount: UseQueryResult<
    CompressedAccountWithMerkleContext | null,
    Error
  >;
}) {
  const { data: compressedBalance } = useGetCompressedBalanceByOwner(
    address.toBase58(),
  );

  // Use the custom hook to fetch domain names
  const [userDomains, loadingDomains] = useUserDomains(address.toBase58());
  const router = useRouter();
  const { cluster } = useCluster();

  // Fetch the token list
  const { data: tokenList, isLoading: tokenListLoading } =
    useGetTokenListStrict();

  // Determine the type of account and token name if applicable
  const { accountType, tokenName, tokenImageURI } = React.useMemo(() => {
    const addressStr = address.toBase58();
    let type = null;
    let name = null;
    let imageURI = null;

    if (tokenList) {
      const token = tokenList.find((token) => token.address === addressStr);
      if (token) {
        type = "Token";
        name = token.name;
        imageURI = token.logoURI;
      }
    }

    if (!type && PROGRAM_INFO_BY_ID[addressStr]) type = "Program";
    if (!type && SerumMarketRegistry.get(addressStr, cluster)) type = "Market";
    if (!type && compressedBalance && compressedBalance.value)
      type = "Compressed";

    return { accountType: type, tokenName: name, tokenImageURI: imageURI };
  }, [address, cluster, tokenList, compressedBalance]);

  return (
    <div className="mb-8 flex items-center gap-4">
      {tokenImageURI ? (
        <Image
          loader={cloudflareLoader}
          src={tokenImageURI}
          alt={tokenName || "Token"}
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
          size={80}
          name={address.toBase58()}
          variant="marble"
          colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
        />
      )}
      <div className="grid gap-2">
        <div className="text-3xl font-medium leading-none">
          {tokenName || <Address pubkey={address} />}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {accountInfo.isLoading || tokenListLoading ? (
            <Skeleton className="h-7 w-[250px]" />
          ) : (
            <>
              {accountInfo.data?.value || compressedAccount.data ? (
                <>
                  {accountInfo.data?.value &&
                    accountInfo.data?.value.lamports && (
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
                          accountInfo.data?.value.lamports,
                          2,
                        )} SOL`}
                      </span>
                    )}
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
                  {accountType && (
                    <Badge variant="success">{accountType}</Badge>
                  )}
                  {!loadingDomains && userDomains && userDomains.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {userDomains.map((domain) => (
                        <Badge
                          key={domain.address.toBase58()}
                          variant="outline"
                        >
                          {domain.name}
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
