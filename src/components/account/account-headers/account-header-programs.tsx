import { useCluster } from "@/providers/cluster-provider";
import { Cluster } from "@/utils/cluster";
import { shortenLong } from "@/utils/common";
import { PROGRAM_INFO_BY_ID, SPECIAL_IDS, SYSVAR_IDS } from "@/utils/programs";
import { AccountInfo, ParsedAccountData, PublicKey } from "@solana/web3.js";
import Avatar from "boring-avatars";
import { CheckIcon, Copy, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { useProgramVerification } from "@/hooks/useProgramVerification";
import { useWalletLabel } from "@/hooks/useWalletLabel";

import Address from "@/components/common/address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AccountHeaderProgramsProps {
  address: PublicKey;
  accountInfo: AccountInfo<Buffer | ParsedAccountData> | null;
  isClosed?: boolean;
}

const AccountHeaderPrograms: React.FC<AccountHeaderProgramsProps> = ({
  address,
  accountInfo,
  isClosed,
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const router = useRouter();
  const { cluster, endpoint } = useCluster();
  const programId = address.toBase58();
  const programInfo = PROGRAM_INFO_BY_ID[programId];
  const specialInfo = SPECIAL_IDS[programId];
  const sysvarInfo = SYSVAR_IDS[programId];
  const displayName = programInfo
    ? programInfo.name
    : specialInfo
      ? specialInfo
      : sysvarInfo
        ? sysvarInfo
        : "Unknown Account";
  const fallbackAddress = address.toBase58();

  const { verificationStatus, isLoading: isVerificationLoading } =
    useProgramVerification(programId);
  const {
    label,
    labelType,
    isLoading: loadingLabel,
    error: labelError,
  } = useWalletLabel(programId);

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const isLocalOrTestNet = [
    Cluster.Localnet,
    Cluster.Testnet,
    Cluster.Custom,
  ].includes(cluster);

  const renderParsedData = () => {
    if (accountInfo && "parsed" in accountInfo.data) {
      const { parsed } = accountInfo.data;
      if (parsed.type === "fees") {
        return (
          <div className="flex flex-col items-center md:ml-auto md:items-end">
            <div className="flex flex-col text-sm text-muted-foreground">
              <strong>Lamports per Signature</strong>{" "}
              {parsed.info.feeCalculator.lamportsPerSignature}
            </div>
          </div>
        );
      } else if (parsed.type === "rewards") {
        return (
          <div className="flex flex-col items-center md:ml-auto md:items-end">
            <div className="flex flex-col text-sm text-muted-foreground">
              <strong>Validator Point Value</strong>{" "}
              {parsed.info.validatorPointValue}
            </div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="mx-[-1rem] md:mx-0">
      <Card className="mb-8 w-full space-y-4 p-6 md:space-y-6">
        <CardHeader className="relative flex flex-col items-start gap-4 md:flex-row md:gap-6">
          <div className="relative flex w-full items-center justify-center md:w-auto md:justify-start">
            <Avatar
              size={80}
              name={fallbackAddress}
              variant="pixel"
              colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
            />
            {isLocalOrTestNet && (
              <div className="absolute right-0 top-0 md:hidden">
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
            )}
          </div>
          <div className="flex w-full flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div className="text-2xl font-medium leading-none md:text-left">
              <div className="flex flex-col items-center justify-center gap-2 md:flex-row md:justify-start">
                {displayName || <Address pubkey={address} short />}
                <Badge variant={isClosed ? "outline" : "success"}>
                  {isClosed ? "Closed" : "Program"}
                </Badge>
                {!isVerificationLoading && verificationStatus?.is_verified && (
                  <Badge variant="success">Verifiable Build</Badge>
                )}
                {!loadingLabel && label && (
                  <Badge variant="secondary">{label}</Badge>
                )}
                {!loadingLabel && labelType && (
                  <Badge variant="outline">{labelType}</Badge>
                )}
              </div>
              <div className="mt-2 text-sm text-muted-foreground md:mt-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="mr-2 mt-1 h-5 w-5 rounded-[6px] [&_svg]:size-3.5"
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
            </div>
            {renderParsedData()}
          </div>
          {isLocalOrTestNet && (
            <div className="ml-auto mt-4 hidden self-start font-medium md:mt-0 md:flex">
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
          )}
        </CardHeader>
      </Card>
    </div>
  );
};

export default AccountHeaderPrograms;
